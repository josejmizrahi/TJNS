import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import 'reflect-metadata';

export enum TokenType {
  SHEKEL = 'shekel',
  MITZVAH = 'mitzvah'
}

@Entity('tokens')
export class TokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column({
    type: 'enum',
    enum: TokenType,
    default: TokenType.SHEKEL
  })
  type!: TokenType;

  @Column('decimal', { precision: 18, scale: 6 })
  balance!: number;

  @Column()
  xrplAddress!: string;

  @Column('jsonb', { default: {} })
  metadata: Record<string, unknown> = {};

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor(partial: Partial<TokenEntity> = {}) {
    Object.assign(this, partial);
  }
}
