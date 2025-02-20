import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import 'reflect-metadata';
import { VerificationLevel } from '../../common/enums/user';

export enum HebrewNameType {
  BIRTH = 'birth',
  CHOSEN = 'chosen',
  BOTH = 'both'
}

export enum TribalAffiliation {
  KOHEN = 'kohen',
  LEVI = 'levi',
  ISRAEL = 'israel'
}

export enum JewishAffiliation {
  ORTHODOX = 'orthodox',
  CONSERVATIVE = 'conservative',
  REFORM = 'reform',
  RECONSTRUCTIONIST = 'reconstructionist',
  SECULAR = 'secular',
  OTHER = 'other'
}

@Entity('jewish_identities')
export class JewishIdentityEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column({ nullable: true })
  hebrewName?: string;

  @Column({
    type: 'enum',
    enum: HebrewNameType,
    nullable: true
  })
  hebrewNameType?: HebrewNameType;

  @Column({
    type: 'enum',
    enum: JewishAffiliation,
    nullable: true
  })
  affiliation?: JewishAffiliation;

  @Column({ nullable: true })
  synagogue?: string;

  @Column({ nullable: true })
  rabbi?: string;

  @Column({ nullable: true })
  community?: string;

  @Column({
    type: 'enum',
    enum: TribalAffiliation,
    nullable: true
  })
  tribalAffiliation?: TribalAffiliation;

  @Column('jsonb', { nullable: true })
  maternalAncestry?: {
    lineage: string[];
    documents: Array<{
      type: string;
      ipfsHash: string;
      verifiedAt?: Date;
      verifiedBy?: string;
    }>;
  };

  @Column('jsonb', { nullable: true })
  paternalAncestry?: {
    lineage: string[];
    documents: Array<{
      type: string;
      ipfsHash: string;
      verifiedAt?: Date;
      verifiedBy?: string;
    }>;
  };

  @Column({ 
    type: 'enum',
    enum: VerificationLevel,
    default: VerificationLevel.NONE
  })
  verificationLevel!: VerificationLevel;

  @Column('jsonb', { default: [] })
  verificationDocuments!: Array<{
    type: string;
    ipfsHash: string;
    encryptionTag: string;
    verifiedAt?: Date;
    verifiedBy?: string;
  }>;

  @Column('jsonb', { nullable: true })
  familyHistory?: {
    maternalLineage?: string[];
    paternalLineage?: string[];
    conversionDetails?: {
      date: string;
      location: string;
      authority: string;
    };
  };

  @Column('jsonb', { default: '{}' })
  familyTreeData!: {
    nodes: Array<{
      id: string;
      type: string;
      name: string;
      documents?: Array<{
        type: string;
        ipfsHash: string;
        verifiedAt?: Date;
        verifiedBy?: string;
      }>;
    }>;
    edges: Array<{
      from: string;
      to: string;
      relationship: string;
    }>;
  };

  @Column('text', { array: true, default: [] })
  verifiedBy!: string[];

  @Column('jsonb', { default: {} })
  metadata: Record<string, unknown> = {};

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor(partial: Partial<JewishIdentityEntity> = {}) {
    Object.assign(this, partial);
  }
}
