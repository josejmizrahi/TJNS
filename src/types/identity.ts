// Types based on XRPL documentation
// Will be replaced with actual XRPL types when dependencies are added

export enum IdentityLevel {
  BASIC = 'BASIC',
  VERIFIED = 'VERIFIED',
  CERTIFIED = 'CERTIFIED'
}

export type TrustLineFlags = {
  requireAuth?: boolean;
  freezeEnabled?: boolean;
}

export interface IdentityDocument {
  type: string;
  hash: string;  // IPFS hash
  metadata: {
    issuer: string;
    issuanceDate: string;
    expiryDate?: string;
  };
}

export interface IdentityVerification {
  type: 'TrustSet';
  account: string;
  flags: {
    requireAuth: boolean;
    freezeEnabled: boolean;
  };
  limitAmount: {
    currency: string;
    issuer: string;
    value: string;
  };
}

export interface DocumentVerification {
  type: 'Payment';
  memos: [{
    type: 'ipfs';
    data: string;  // IPFS hash
  }];
}

export interface IdentityProfile {
  userId: string;
  xrplAccount: string;
  level: IdentityLevel;
  documents: IdentityDocument[];
  verificationStatus: {
    isVerified: boolean;
    verifiedAt?: string;
    verifiedBy?: string;
  };
  trustLineStatus: {
    isAuthorized: boolean;
    currency: string;
    issuer: string;
  };
}
