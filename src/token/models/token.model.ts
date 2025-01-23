import { TokenBalance, Transaction, TokenType, TransactionType, TransactionStatus, TrustLineStatus } from '../../common/types/models';

// Database table types for Supabase
export interface TokenBalanceRecord {
  id: string;
  user_id: string;
  currency: TokenType;
  balance: string;
  trust_line_status: TrustLineStatus;
  created_at: Date;
  updated_at: Date;
}

export interface TransactionRecord {
  id: string;
  from_user_id: string;
  to_user_id: string;
  amount: string;
  currency: TokenType;
  type: TransactionType;
  status: TransactionStatus;
  xrpl_tx_hash?: string;
  metadata?: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface MitzvahPointsRuleRecord {
  id: string;
  action_type: string;
  base_points: number;
  multiplier: number;
  max_points?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Domain models
export class TokenBalanceEntity implements TokenBalance {
  id: string;
  userId: string;
  currency: TokenType;
  balance: string;
  trustLineStatus: TrustLineStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(record: TokenBalanceRecord) {
    this.id = record.id;
    this.userId = record.user_id;
    this.currency = record.currency;
    this.balance = record.balance;
    this.trustLineStatus = record.trust_line_status;
    this.createdAt = record.created_at;
    this.updatedAt = record.updated_at;
  }
}

export class TransactionEntity implements Transaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: string;
  currency: TokenType;
  type: TransactionType;
  status: TransactionStatus;
  xrplTxHash?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(record: TransactionRecord) {
    this.id = record.id;
    this.fromUserId = record.from_user_id;
    this.toUserId = record.to_user_id;
    this.amount = record.amount;
    this.currency = record.currency;
    this.type = record.type;
    this.status = record.status;
    this.xrplTxHash = record.xrpl_tx_hash;
    this.createdAt = record.created_at;
    this.updatedAt = record.updated_at;
  }
}

export class MitzvahPointsRuleEntity {
  id: string;
  actionType: string;
  basePoints: number;
  multiplier: number;
  maxPoints?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(record: MitzvahPointsRuleRecord) {
    this.id = record.id;
    this.actionType = record.action_type;
    this.basePoints = record.base_points;
    this.multiplier = record.multiplier;
    this.maxPoints = record.max_points;
    this.isActive = record.is_active;
    this.createdAt = record.created_at;
    this.updatedAt = record.updated_at;
  }
}
