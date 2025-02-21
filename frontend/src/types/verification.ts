import { VerificationLevel } from '../common/enums/user';

export interface VerificationDocument {
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  verifiedAt?: string;
}

export interface VerificationStatusData {
  level: VerificationLevel;
  documents: VerificationDocument[];
}

export interface DocumentUploadData {
  type: string;
  file: File;
  metadata?: {
    userId?: string;
    verificationLevel?: VerificationLevel;
  };
}

export interface CommunityVerificationData {
  synagogueName: string;
  rabbiName: string;
  rabbiEmail: string;
  hebrewName: string;
  communityRole?: string;
  documents: File[];
}

export interface GovernanceVerificationData {
  multiPartyDocument: File;
  historicalDocument: File;
  additionalReferences: Array<{
    name: string;
    email: string;
    role: string;
  }>;
}

export interface VideoVerificationData {
  recording: Blob;
  metadata?: {
    userId?: string;
    verificationLevel?: VerificationLevel;
  };
}
