import { VerificationLevel } from '../../common/enums/user';
import { VerificationDocument } from '../../types/verification';

export interface VerificationStatusProps {
  level: VerificationLevel;
  documents: VerificationDocument[];
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
  onSubmit: (data: {
    synagogueName: string;
    rabbiName: string;
    rabbiEmail: string;
    hebrewName: string;
    communityRole?: string;
    documents: File[];
  }) => Promise<void>;
  isLoading: boolean;
}

export interface GovernanceVerificationProps {
  onSubmit: (data: {
    multiPartyDocument: File;
    historicalDocument: File;
    additionalReferences: Array<{
      name: string;
      email: string;
      role: string;
    }>;
  }) => Promise<void>;
  isLoading: boolean;
}
