export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VERIFIER = 'verifier',
  MODERATOR = 'moderator'
}

export enum VerificationLevel {
  NONE = 'none',
  EMAIL = 'email',
  PHONE = 'phone',
  KYC = 'kyc',
  ADVANCED = 'advanced'
}

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended'
}
