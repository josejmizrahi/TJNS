import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { StorageType } from '../../common/utils/storage';

export enum ListingStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  SOLD = 'sold',
  SUSPENDED = 'suspended'
}

export enum ListingCategory {
  FOOD = 'food',
  JUDAICA = 'judaica',
  BOOKS = 'books',
  SERVICES = 'services',
  EDUCATION = 'education',
  OTHER = 'other'
}

@Entity('marketplace_listings')
export class ListingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  sellerId!: string;

  @Column()
  title!: string;

  @Column('text')
  description!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column({
    type: 'enum',
    enum: ListingCategory
  })
  category!: ListingCategory;

  @Column({
    type: 'enum',
    enum: ListingStatus,
    default: ListingStatus.DRAFT
  })
  status!: ListingStatus;

  @Column('jsonb', { nullable: true })
  kosherCertification?: {
    certifier: string;
    certificateNumber: string;
    expirationDate: Date;
  };

  @Column('simple-array', { nullable: true })
  images?: string[];

  @Column({ type: 'enum', enum: StorageType, nullable: true })
  imageStorageType?: StorageType;

  @Column('jsonb', { nullable: true })
  shipping?: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    methods: string[];
  };

  @Column('jsonb', { default: {} })
  metadata: Record<string, unknown> = {};

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor(partial: Partial<ListingEntity> = {}) {
    Object.assign(this, partial);
  }
}
