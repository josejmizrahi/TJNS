import { DatabaseAdapter } from '../../common/adapters/database.adapter';
import { adapterFactory } from '../../common/adapters/adapter-factory';
import { AppError } from '../../common/middleware/error';
import { TokenEntity, TokenType } from '../models/token.model';
import { XrplService } from './xrpl.service';

export class TokenService {
  private database: DatabaseAdapter;
  private xrpl: XrplService;

  constructor() {
    this.database = adapterFactory.getDatabaseAdapter();
    this.xrpl = new XrplService();
  }

  async createToken(userId: string, type: TokenType): Promise<TokenEntity> {
    const xrplAddress = await this.xrpl.createTrustline(type);
    
    const token = new TokenEntity({
      userId,
      type,
      balance: 0,
      xrplAddress
    });

    return this.database.createToken(token);
  }

  async getTokenBalance(userId: string, type: TokenType): Promise<number> {
    const token = await this.database.getTokenByUserAndType(userId, type);
    if (!token) {
      throw new AppError(404, 'Token not found');
    }

    // Sync with XRPL balance
    const xrplBalance = await this.xrpl.getBalance(token.xrplAddress, type);
    if (xrplBalance !== token.balance) {
      await this.database.updateToken(token.id, { balance: xrplBalance });
      token.balance = xrplBalance;
    }

    return token.balance;
  }

  async transfer(
    fromUserId: string,
    toUserId: string,
    amount: number,
    type: TokenType
  ): Promise<void> {
    const fromToken = await this.database.getTokenByUserAndType(fromUserId, type);
    const toToken = await this.database.getTokenByUserAndType(toUserId, type);

    if (!fromToken || !toToken) {
      throw new AppError(404, 'Token not found');
    }

    if (fromToken.balance < amount) {
      throw new AppError(400, 'Insufficient balance');
    }

    // Execute XRPL transfer
    await this.xrpl.transfer(fromToken.xrplAddress, toToken.xrplAddress, amount, type);

    // Update local balances
    await this.database.updateToken(fromToken.id, { balance: fromToken.balance - amount });
    await this.database.updateToken(toToken.id, { balance: toToken.balance + amount });
  }
}

export default new TokenService();
