import { VerificationLevel } from './types';

export interface EncryptedData {
  encrypted: string;
  key: string;
}

export interface DocumentUploadData {
  type: string;
  file: EncryptedData;
  metadata?: {
    userId?: string;
    verificationLevel?: VerificationLevel;
  };
}

export interface CommunityData {
  synagogueName: string;
  rabbiName: string;
  rabbiEmail: string;
  hebrewName: string;
  communityRole?: string;
  documents: File[];
}

export interface GovernanceData {
  multiPartyDocument: File;
  historicalDocument: File;
  additionalReferences: Array<{
    name: string;
    email: string;
    role: string;
  }>;
}

export interface VerificationStatusProps {
  level: VerificationLevel;
  documents: Array<{
    type: string;
    status: 'pending' | 'approved' | 'rejected';
    verifiedAt?: string;
  }>;
  onStartVerification: () => void;
}

export interface DocumentUploadProps {
  documentType: string;
  description: string;
  onUpload: (file: File) => Promise<void>;
  isLoading: boolean;
}

export interface VideoVerificationProps {
  onSubmit: (recording: Blob) => Promise<void>;
  isLoading: boolean;
}

export interface CommunityVerificationProps {
  onSubmit: (data: CommunityData) => Promise<void>;
  isLoading: boolean;
}

export interface GovernanceVerificationProps {
  onSubmit: (data: GovernanceData) => Promise<void>;
  isLoading: boolean;
}
