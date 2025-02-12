import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../common/types/models';

export enum HebrewNameType {
  BIRTH = 'birth',
  CHOSEN = 'chosen',
  BOTH = 'both'
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
