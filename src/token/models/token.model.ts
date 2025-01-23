import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TokenBalance, Transaction, TokenType, TransactionType, TransactionStatus } from '../../common/types/models';

@Entity('token_balances')
export class TokenBalanceEntity implements TokenBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: TokenType
  })
  currency: TokenType;

  @Column()
  balance: string;

  @Column()
  trustLineStatus: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('transactions')
export class TransactionEntity implements Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fromUserId: string;

  @Column()
  toUserId: string;

  @Column()
  amount: string;

  @Column({
    type: 'enum',
    enum: TokenType
  })
  currency: TokenType;

  @Column({
    type: 'enum',
    enum: TransactionType
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus
  })
  status: TransactionStatus;

  @Column({ nullable: true })
  xrplTxHash?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('mitzvah_points_rules')
export class MitzvahPointsRuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  actionType: string;

  @Column()
  basePoints: number;

  @Column({ type: 'float', default: 1.0 })
  multiplier: number;

  @Column({ nullable: true })
  maxPoints?: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
