import { TokenType, TransactionStatus, TrustLineStatus } from '../../blockchain/types';

export enum TransactionType {
  TRANSFER = 'transfer',
  AWARD = 'award',
  REWARD = 'reward',
  ESCROW = 'escrow'
}

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
export interface TokenBalance {
  id: string;
  userId: string;
  currency: TokenType;
  balance: string;
  trustLineStatus?: TrustLineStatus;
  metadata?: Record<string, unknown>;
}

export interface Transaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: string;
  currency: TokenType;
  status: TransactionStatus;
  type: TransactionType;
  xrplTxHash?: string;
  metadata?: Record<string, unknown>;
}

export class TokenBalanceEntity implements TokenBalanceRecord {
  id!: string;
  user_id!: string;
  currency!: TokenType;
  balance!: string;
  trust_line_status!: TrustLineStatus;
  created_at!: Date;
  updated_at!: Date;

  constructor(record: TokenBalanceRecord) {
    this.id = record.id;
    this.user_id = record.user_id;
    this.currency = record.currency;
    this.balance = record.balance;
    this.trust_line_status = record.trust_line_status;
    this.created_at = record.created_at;
    this.updated_at = record.updated_at;
  }
}

export class TransactionEntity implements TransactionRecord {
  id!: string;
  from_user_id!: string;
  to_user_id!: string;
  amount!: string;
  currency!: TokenType;
  type!: TransactionType;
  status!: TransactionStatus;
  xrpl_tx_hash?: string;
  created_at!: Date;
  updated_at!: Date;

  constructor(record: TransactionRecord) {
    this.id = record.id;
    this.from_user_id = record.from_user_id;
    this.to_user_id = record.to_user_id;
    this.amount = record.amount;
    this.currency = record.currency;
    this.type = record.type;
    this.status = record.status;
    this.xrpl_tx_hash = record.xrpl_tx_hash;
    this.created_at = record.created_at;
    this.updated_at = record.updated_at;
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
