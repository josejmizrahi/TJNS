import { Client, Wallet, Payment, TrustSet } from 'xrpl';
import { blockchainConfig, xrplClient } from '../config/blockchain';
import { adapterFactory } from '../adapters';
import { DatabaseAdapter } from '../adapters/supabase.adapter';
import { TokenType, TransactionStatus, TrustLineStatus, EscrowStatus } from '../types/models';
import { AppError } from '../middleware/error';

export class BlockchainService {
  private client: Client;
  private database: DatabaseAdapter;

  constructor() {
    this.client = xrplClient;
    this.database = adapterFactory.getDatabaseAdapter();
  }

  async createTrustLine(
    userWallet: Wallet,
    currency: TokenType,
    limit: string
  ): Promise<void> {
    try {
      // Update trust line status to pending in Supabase
      await this.database.updateTokenBalance(
        userWallet.address,
        currency,
        '0',
        { trustLineStatus: TrustLineStatus.PENDING }
      );

      const trustSet: TrustSet = {
        TransactionType: 'TrustSet',
        Account: userWallet.address,
        LimitAmount: {
          currency,
          issuer: blockchainConfig.coldWallet!,
          value: limit,
        },
      };

      const prepared = await this.client.autofill(trustSet);
      const signed = userWallet.sign(prepared);
      await this.client.submitAndWait(signed.tx_blob);

      // Update trust line status to active in Supabase
      await this.database.updateTokenBalance(
        userWallet.address,
        currency,
        '0',
        { trustLineStatus: TrustLineStatus.ACTIVE }
      );
    } catch (error: unknown) {
      // Update trust line status to failed in Supabase
      await this.database.updateTokenBalance(
        userWallet.address,
        currency,
        '0',
        { trustLineStatus: TrustLineStatus.NONE }
      );
      throw error instanceof Error 
        ? new AppError(500, `Trust line creation failed: ${error.message}`)
        : new AppError(500, 'Trust line creation failed');
    }
  }

  async transferTokens(
    fromWallet: Wallet,
    toAddress: string,
    amount: string,
    currency: TokenType
  ): Promise<void> {
    // Create transaction record in pending state
    const transaction = await this.database.createTransaction({
      fromUserId: fromWallet.address,
      toUserId: toAddress,
      amount,
      currency,
      status: TransactionStatus.PENDING
    });

    try {
      const payment: Payment = {
        TransactionType: 'Payment',
        Account: fromWallet.address,
        Destination: toAddress,
        Amount: {
          currency,
          value: amount,
          issuer: blockchainConfig.coldWallet!,
        },
      };

      const prepared = await this.client.autofill(payment);
      const signed = fromWallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);

      // Update transaction record with success status and hash
      await this.database.updateTransaction(transaction.id, {
        status: TransactionStatus.COMPLETED,
        xrplTxHash: result.result.hash
      });

      // Update balances in Supabase
      const fromBalance = await this.getBalance(fromWallet.address, currency);
      const toBalance = await this.getBalance(toAddress, currency);

      await Promise.all([
        this.database.updateTokenBalance(fromWallet.address, currency, fromBalance),
        this.database.updateTokenBalance(toAddress, currency, toBalance)
      ]);
    } catch (error: unknown) {
      // Update transaction record with failed status
      await this.database.updateTransaction(transaction.id, {
        status: TransactionStatus.FAILED,
        ...(error instanceof Error && { errorMessage: error.message })
      });
      throw error instanceof Error
        ? new AppError(500, `Token transfer failed: ${error.message}`)
        : new AppError(500, 'Token transfer failed');
    }
  }

  async getWallet(address: string): Promise<Wallet> {
    // For development/testing, create a deterministic wallet from address
    // TODO: Implement proper wallet management with secure key storage
    const seed = 'sn' + Buffer.from(address).toString('hex').slice(0, 29);
    return Wallet.fromSeed(seed);
  }

  async getBalance(
    address: string,
    currency: TokenType
  ): Promise<string> {
    const balances = await this.client.getBalances(address);
    const balance = balances.find(
      (b) => 
        b.currency === currency && 
        b.issuer === blockchainConfig.coldWallet
    );

    const xrplBalance = balance ? balance.value : '0';

    // Update balance in Supabase
    await this.database.updateTokenBalance(address, currency, xrplBalance);

    return xrplBalance;
  }

  async createEscrow(
    fromWallet: Wallet,
    toAddress: string,
    amount: string,
    currency: TokenType,
    _condition: string,
    _cancelAfter: number
  ): Promise<void> {
    // Create escrow record in pending state
    const escrow = await this.database.createEscrow({
      fromUserId: fromWallet.address,
      toUserId: toAddress,
      amount,
      currency,
      status: EscrowStatus.CREATED
    });

    try {
      // TODO: Implement XRPL escrow creation
      throw new AppError(501, 'Escrow creation not implemented');
    } catch (error: unknown) {
      await this.database.updateEscrow(escrow.id, {
        status: EscrowStatus.CANCELLED,
        ...(error instanceof Error && { errorMessage: error.message })
      });
      throw error instanceof Error
        ? new AppError(500, `Escrow creation failed: ${error.message}`)
        : new AppError(500, 'Escrow creation failed');
    }
  }

  async executeHook(
    hookName: keyof typeof blockchainConfig.hooks,
    _params: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    if (!blockchainConfig.hooks[hookName]) {
      throw new AppError(400, `Hook ${hookName} not configured`);
    }
    // TODO: Implement hook execution
    throw new AppError(501, 'Hook execution not implemented');
  }
}

export default new BlockchainService();
