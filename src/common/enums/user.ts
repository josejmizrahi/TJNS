export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VERIFIER = 'verifier',
  MODERATOR = 'moderator'
}

export enum VerificationLevel {
  NONE = 'none',
  BASIC = 'basic', // Level 1: Baseline Trust
  COMMUNITY = 'community', // Level 2: Community Trust
  FINANCIAL = 'financial', // Level 3: Financial Trust
  GOVERNANCE = 'governance' // Level 4: Governance Trust
}

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended'
}
