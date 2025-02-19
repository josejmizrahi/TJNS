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
    nodes: any[];
    edges: any[];
  };
  maternalAncestry?: {
    lineage: string[];
    documents: any[];
  };
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, unknown>;
}
