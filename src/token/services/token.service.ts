// XRPL client is imported from blockchain config
import { BlockchainService } from '../../common/utils/blockchain';
import { 
  Transaction, 
  TokenType, 
  TransactionType, 
  TransactionStatus,
  TrustLineStatus,
  VerificationLevel
} from '../../common/types/models';
import { AppError } from '../../common/middleware/error';
import { blockchainConfig } from '../../common/config/blockchain';
import { adapterFactory } from '../../common/adapters';
import { DatabaseAdapter } from '../../common/adapters/supabase.adapter';
import { RealtimeAdapter } from '../../common/adapters/realtime.adapter';

export class TokenService {
  private database: DatabaseAdapter;
  private realtime: RealtimeAdapter;

  constructor(
    private blockchain: BlockchainService
  ) {
    this.database = adapterFactory.getDatabaseAdapter();
    this.realtime = adapterFactory.getRealtimeAdapter();
  }

  async setupTrustLine(
    userId: string,
    currency: TokenType,
    limit: string
  ): Promise<void> {
    const user = await this.database.getUserById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    if (user.verificationLevel === VerificationLevel.NONE) {
      throw new AppError(403, 'User must complete basic verification first');
    }

    // Create trust line on XRPL
    const wallet = await this.blockchain.getWallet(user.walletAddress!);
    await this.blockchain.createTrustLine(wallet, currency, limit);

    // Record trust line status
    await this.database.updateTokenBalance(userId, currency, '0', {
      trustLineStatus: TrustLineStatus.ACTIVE
    });

    // Notify about trust line creation
    await this.realtime.publish(
      `user_updates_${userId}`,
      'trust_line_created',
      { userId, currency }
    );
  }

  async transfer(
    fromUserId: string,
    toUserId: string,
    amount: string,
    currency: TokenType
  ): Promise<Transaction> {
    // Validate transfer requirements
    await this.validateTransfer(fromUserId, toUserId, amount, currency);

    // Get user wallets
    const fromUser = await this.database.getUserById(fromUserId);
    const toUser = await this.database.getUserById(toUserId);

    if (!fromUser?.walletAddress || !toUser?.walletAddress) {
      throw new AppError(400, 'Both users must have active wallets');
    }

    // Execute transfer on XRPL
    const txHash = await this.blockchain.transferTokens(
      await this.blockchain.getWallet(fromUser.walletAddress),
      toUser.walletAddress,
      amount,
      currency
    );

    // Record transaction
    const transaction = await this.database.createTransaction({
      fromUserId,
      toUserId,
      amount,
      currency,
      type: TransactionType.TRANSFER,
      status: TransactionStatus.COMPLETED,
      xrplTxHash: typeof txHash === 'string' ? txHash : undefined
    });

    // Update balances
    const fromBalance = await this.database.getTokenBalance(fromUserId, currency);
    const toBalance = await this.database.getTokenBalance(toUserId, currency);

    await this.database.updateTokenBalance(
      fromUserId,
      currency,
      (parseFloat(fromBalance!) - parseFloat(amount)).toString()
    );

    await this.database.updateTokenBalance(
      toUserId,
      currency,
      (parseFloat(toBalance!) + parseFloat(amount)).toString()
    );

    // Notify about transaction
    await this.realtime.publish(
      'transactions',
      'transfer_completed',
      { transaction }
    );

    return transaction;
  }

  async getBalance(
    userId: string,
    currency: TokenType
  ): Promise<string> {
    const balance = await this.database.getTokenBalance(userId, currency);
    if (!balance) {
      return '0';
    }
    return balance;
  }

  async calculateMitzvahPoints(
    userId: string,
    action: string,
    metadata: Record<string, unknown>
  ): Promise<number> {
    // Get rule for action type
    const rule = await this.database.getMitzvahPointsRule(action);
    if (!rule || !rule.isActive) {
      throw new AppError(400, `No active rule found for action: ${action}`);
    }

    // Calculate base points with multiplier
    let points = rule.basePoints * rule.multiplier;

    // Apply any contextual multipliers from metadata
    if (metadata.multiplier) {
      points *= metadata.multiplier;
    }

    // Cap points if maximum is defined
    if (rule.maxPoints) {
      points = Math.min(points, rule.maxPoints);
    }

    return Math.floor(points);
  }

  async awardMitzvahPoints(
    userId: string,
    points: number,
    reason: string
  ): Promise<void> {
    const user = await this.database.getUserById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Create transaction record
    const transaction = await this.database.createTransaction({
      fromUserId: blockchainConfig.coldWallet!, // System wallet
      toUserId: userId,
      amount: points.toString(),
      currency: TokenType.MVP,
      type: TransactionType.REWARD,
      status: TransactionStatus.COMPLETED
    });

    // Update user's MVP balance
    const currentBalance = await this.getBalance(userId, TokenType.MVP);
    await this.database.updateTokenBalance(
      userId,
      TokenType.MVP,
      (parseFloat(currentBalance) + points).toString()
    );

    // Notify about points award
    await this.realtime.publish(
      `user_updates_${userId}`,
      'mitzvah_points_awarded',
      { userId, points, reason, transaction }
    );
  }

  private async validateTransfer(
    fromUserId: string,
    toUserId: string,
    amount: string,
    currency: TokenType
  ): Promise<boolean> {
    // Check users exist and are verified
    const [fromUser, toUser] = await Promise.all([
      this.database.getUserById(fromUserId),
      this.database.getUserById(toUserId)
    ]);

    if (!fromUser || !toUser) {
      throw new AppError(404, 'One or both users not found');
    }

    if (fromUser.verificationLevel === VerificationLevel.NONE ||
        toUser.verificationLevel === VerificationLevel.NONE) {
      throw new AppError(403, 'Both users must be verified to transfer tokens');
    }

    // Check trust lines are active
    const [fromBalance, toBalance] = await Promise.all([
      this.database.getTokenBalance(fromUserId, currency),
      this.database.getTokenBalance(toUserId, currency)
    ]);

    if (!fromBalance || !toBalance) {
      throw new AppError(400, 'Trust lines not established');
    }

    // Check sufficient balance
    if (parseFloat(fromBalance) < parseFloat(amount)) {
      throw new AppError(400, 'Insufficient balance');
    }

    return true;
  }
}

export default new TokenService(new BlockchainService());
