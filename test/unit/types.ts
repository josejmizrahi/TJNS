import { StorageType } from '../../src/common/utils/storage';

export interface StorageResponse {
  path: string;
  type: StorageType;
  tag?: string;
}

export interface JewishIdentityMock {
  id: string;
  userId?: string;
  hebrewName?: string;
  verificationDocuments?: Array<{
    type: string;
    ipfsHash: string;
    encryptionTag: string;
    verifiedAt?: Date;
  }>;
  verificationLevel?: string;
  verifiedBy?: string[];
  familyTreeData?: {
    nodes: Array<{
      id: string;
      type: string;
      name: string;
    }>;
    edges: Array<{
      from: string;
      to: string;
      relationship: string;
    }>;
  };
  maternalAncestry?: {
    lineage: string[];
    documents: Array<{
      type: string;
      ipfsHash: string;
      verifiedAt?: Date;
      verifiedBy?: string;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, unknown>;
}
