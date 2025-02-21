export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VERIFIER = 'verifier',
  MODERATOR = 'moderator'
}

// Moved to ../types/verification.ts

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended'
}
