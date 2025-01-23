import { 
  User, 
  UserProfile, 
  UserRole, 
  VerificationLevel, 
  UserStatus,
  DocumentType,
  DocumentStatus
} from '../../common/types/models';

// Database table types for Supabase
export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  verification_level: VerificationLevel;
  status: UserStatus;
  profile: UserProfile;
  wallet_address?: string;
  created_at: Date;
  updated_at: Date;
}

export interface KYCDocumentRecord {
  id: string;
  user_id: string;
  type: DocumentType;
  ipfs_cid: string;
  encryption_tag: string;
  status: DocumentStatus;
  verified_at?: Date;
  verified_by?: string;
  created_at: Date;
  updated_at: Date;
}

// Domain models
export class UserEntity implements User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  verificationLevel: VerificationLevel;
  status: UserStatus;
  profile: UserProfile;
  walletAddress?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(record: UserRecord) {
    this.id = record.id;
    this.email = record.email;
    this.passwordHash = record.password_hash;
    this.role = record.role;
    this.verificationLevel = record.verification_level;
    this.status = record.status;
    this.profile = record.profile;
    this.walletAddress = record.wallet_address;
    this.createdAt = record.created_at;
    this.updatedAt = record.updated_at;
  }
}

export class KYCDocumentEntity {
  id: string;
  userId: string;
  type: DocumentType;
  ipfsCid: string;
  encryptionTag: string;
  status: DocumentStatus;
  verifiedAt?: Date;
  verifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(record: KYCDocumentRecord) {
    this.id = record.id;
    this.userId = record.user_id;
    this.type = record.type;
    this.ipfsCid = record.ipfs_cid;
    this.encryptionTag = record.encryption_tag;
    this.status = record.status;
    this.verifiedAt = record.verified_at;
    this.verifiedBy = record.verified_by;
    this.createdAt = record.created_at;
    this.updatedAt = record.updated_at;
  }
}
