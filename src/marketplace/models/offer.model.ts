import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum OfferStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  WITHDRAWN = 'withdrawn'
}

@Entity('marketplace_offers')
export class OfferEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  listingId!: string;

  @Column()
  buyerId!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @Column({
    type: 'enum',
    enum: OfferStatus,
    default: OfferStatus.PENDING
  })
  status!: OfferStatus;

  @Column('text', { nullable: true })
  message?: string;

  @Column('jsonb', { default: {} })
  metadata: Record<string, unknown> = {};

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor(partial: Partial<OfferEntity> = {}) {
    Object.assign(this, partial);
  }
}
