import { Client, Wallet, Payment, TrustSet } from 'xrpl';
import { blockchainConfig, xrplClient } from '../config/blockchain';
import { adapterFactory } from '../adapters';
import { DatabaseAdapter } from '../adapters/supabase.adapter';
import { TokenType, TransactionStatus, TrustLineStatus } from '../types/models';

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
    } catch (error) {
      // Update trust line status to failed in Supabase
      await this.database.updateTokenBalance(
        userWallet.address,
        currency,
        '0',
        { trustLineStatus: TrustLineStatus.NONE }
      );
      throw error;
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
    } catch (error) {
      // Update transaction record with failed status
      await this.database.updateTransaction(transaction.id, {
        status: TransactionStatus.FAILED
      });
      throw error;
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
    currency: string,
    condition: string,
    cancelAfter: number
  ): Promise<void> {
    // Implement escrow creation logic
    // This will be expanded based on specific escrow requirements
  }

  async executeHook(
    hookName: string,
    params: any
  ): Promise<any> {
    // Implement hook execution logic
    // This will be expanded based on specific hook requirements
  }
}

export default new BlockchainService();
