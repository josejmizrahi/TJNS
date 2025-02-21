export interface MFAConfig {
  issuer: string;
  secretKey: string;
  algorithm: 'sha1' | 'sha256' | 'sha512';
  digits: 6 | 8;
  period: 30;
}

export interface TOTPToken {
  token: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface BackupCode {
  code: string;
  used: boolean;
  createdAt: Date;
}

export interface MFAStatus {
  enabled: boolean;
  type: 'totp' | 'backup';
  lastUsed?: Date;
}
