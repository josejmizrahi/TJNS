export enum TokenType {
  SHK = 'SHK',  // ShekelCoin
  MVP = 'MVP'   // MitzvahPoints
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum TrustLineStatus {
  NONE = 'none',
  PENDING = 'pending',
  ACTIVE = 'active',
  FROZEN = 'frozen'
}

export enum EscrowStatus {
  CREATED = 'created',
  EXECUTED = 'executed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export interface BlockchainTransaction {
  type: string;
  [key: string]: unknown;
}
