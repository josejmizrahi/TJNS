import { StorageType } from '../../common/utils/storage';

export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'failed';

export interface BaseVerification {
  userId: string;
  status: VerificationStatus;
  verificationId: string;
  createdAt: Date;
  completedAt?: Date;
  verifierId?: string;
}

export interface DocumentVerification extends BaseVerification {
  documentHashes: string[];
  documentType: string;
  storageType: StorageType;
}

export interface VideoVerification extends BaseVerification {
  scheduledTime: Date;
  recordingHash?: string;
  notes?: string;
}

export interface PhoneVerification extends BaseVerification {
  phoneNumber: string;
  code: string;
  attempts: number;
  expiresAt: Date;
}

export interface MultiPartyVerification extends BaseVerification {
  requiredVerifiers: number;
  verifierIds: string[];
  verificationLevel: 'community' | 'governance';
}

export interface HistoricalValidation extends BaseVerification {
  documentHashes: string[];
  validationType: 'participation' | 'community' | 'genealogy';
  metadata: Record<string, unknown>;
}
