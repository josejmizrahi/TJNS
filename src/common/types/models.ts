import { VerificationLevel, UserRole, UserStatus } from '../enums/user';
import { DocumentType, DocumentStatus } from '../enums/document';
import { TokenType } from '../../blockchain/types';

export {
  DocumentType,
  DocumentStatus,
  VerificationLevel,
  UserRole,
  UserStatus,
  TokenType
};

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseEntity {
  email: string;
  role: UserRole;
  verificationLevel: VerificationLevel;
  status: UserStatus;
  passwordHash: string;
  profile: UserProfile;
  walletAddress?: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  synagogue?: string;
  community?: string;
  documents: KYCDocument[];
  mfaEnabled: boolean;
  mfaSecret?: string;
  mfaBackupCodes?: string[];
  mfaVerified: boolean;
  jewishIdentityId?: string;
}

export interface KYCDocument {
  id: string;
  type: DocumentType;
  status: DocumentStatus;
  ipfsHash: string;
  ipfsCid?: string;
  storageType?: string;
  verifiedAt?: Date;
  verifiedBy?: string;
  userId: string;
}

export interface MitzvahPointsRuleEntity {
  id: string;
  action_type: string;
  base_points: number;
  multiplier: number;
  max_points?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  metadata?: Record<string, unknown>;
}

export interface Escrow {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: string;
  currency: TokenType;
  status: string;
  expiresAt: Date;
  metadata?: Record<string, unknown>;
}
