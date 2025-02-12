import { VerificationLevel, UserRole } from '../enums/user';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseEntity {
  email: string;
  role: UserRole;
  verificationLevel: VerificationLevel;
  profile: UserProfile;
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
  type: string;
  status: string;
  ipfsHash: string;
  verifiedAt?: Date;
  verifiedBy?: string;
}
