import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

@Entity('marketplace_transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  listingId!: string;

  @Column()
  offerId?: string;

  @Column()
  buyerId!: string;

  @Column()
  sellerId!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING
  })
  status!: TransactionStatus;

  @Column('text', { nullable: true })
  txHash?: string;

  @Column('jsonb', { nullable: true })
  shippingDetails?: {
    address: string;
    trackingNumber?: string;
    carrier?: string;
  };

  @Column('jsonb', { default: {} })
  metadata: Record<string, unknown> = {};

  @CreateDateColumn()
  createdAt!: Date;

  constructor(partial: Partial<TransactionEntity> = {}) {
    Object.assign(this, partial);
  }
}
