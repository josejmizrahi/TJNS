export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VERIFIER = 'verifier',
  MODERATOR = 'moderator'
}

export enum VerificationLevel {
  NONE = 'none',
  BASIC = 'basic',
  VERIFIED = 'verified',
  COMPLETE = 'complete'
}

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended'
}
