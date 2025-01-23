// Base Interfaces
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User & Identity
export interface User extends BaseEntity {
  email: string;
  passwordHash: string;
  role: UserRole;
  verificationLevel: VerificationLevel;
  status: UserStatus;
  profile: UserProfile;
  walletAddress?: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  synagogue?: string;
  community?: string;
  documents: KYCDocument[];
}

export interface KYCDocument {
  id: string;
  userId: string;
  type: DocumentType;
  ipfsCid: string;
  encryptionTag: string;
  status: DocumentStatus;
  verifiedAt?: Date;
  verifiedBy?: string;
}

// Token System
export interface TokenBalance {
  userId: string;
  currency: TokenType;
  balance: string;
  trustLineStatus: TrustLineStatus;
}

export interface Transaction extends BaseEntity {
  fromUserId: string;
  toUserId: string;
  amount: string;
  currency: TokenType;
  type: TransactionType;
  status: TransactionStatus;
  xrplTxHash?: string;
  errorMessage?: string;
}

export interface Escrow extends BaseEntity {
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: string;
  currency: TokenType;
  status: EscrowStatus;
  xrplSequence?: number;
  errorMessage?: string;
}

// Governance
export interface Proposal extends BaseEntity {
  title: string;
  description: string;
  authorId: string;
  status: ProposalStatus;
  votingPeriod: {
    start: Date;
    end: Date;
  };
  votes: Vote[];
  result?: ProposalResult;
}

export interface Vote {
  userId: string;
  proposalId: string;
  choice: VoteChoice;
  weight: number;
  timestamp: Date;
}

// Genealogy
export interface FamilyTree extends BaseEntity {
  ownerId: string;
  name: string;
  description?: string;
  members: FamilyMember[];
  privacyLevel: PrivacyLevel;
}

export interface FamilyMember {
  id: string;
  name: string;
  dateOfBirth?: Date;
  dateOfDeath?: Date;
  relationships: Relationship[];
  documents: FamilyDocument[];
}

export interface FamilyDocument {
  type: FamilyDocumentType;
  ipfsCid: string;
  encryptionTag: string;
  accessLevel: AccessLevel;
}

// Marketplace
export interface Listing extends BaseEntity {
  sellerId: string;
  title: string;
  description: string;
  price: {
    amount: string;
    currency: TokenType;
  };
  category: ProductCategory;
  kosherStatus: KosherStatus;
  status: ListingStatus;
}

export interface Escrow extends BaseEntity {
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: string;
  currency: TokenType;
  status: EscrowStatus;
  xrplSequence?: number;
}

// Enums
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  ORACLE = 'oracle',
  RABBI = 'rabbi'
}

export enum VerificationLevel {
  NONE = 'none',
  BASIC = 'basic',
  VERIFIED = 'verified',
  COMPLETE = 'complete'
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
  PENDING = 'pending'
}

export enum DocumentType {
  ID = 'id',
  PASSPORT = 'passport',
  BIRTH_CERTIFICATE = 'birth_certificate',
  SYNAGOGUE_LETTER = 'synagogue_letter',
  OTHER = 'other'
}

export enum DocumentStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

export interface MitzvahPointsRuleEntity {
  id: string;
  actionType: string;
  basePoints: number;
  multiplier: number;
  maxPoints?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum TokenType {
  SHK = 'SHK',
  MVP = 'MVP'
}

export enum TrustLineStatus {
  NONE = 'none',
  PENDING = 'pending',
  ACTIVE = 'active',
  FROZEN = 'frozen'
}

export enum TransactionType {
  TRANSFER = 'transfer',
  ESCROW = 'escrow',
  REWARD = 'reward',
  FEE = 'fee'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum ProposalStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ENDED = 'ended',
  EXECUTED = 'executed',
  REJECTED = 'rejected'
}

export enum VoteChoice {
  YES = 'yes',
  NO = 'no',
  ABSTAIN = 'abstain'
}

export enum ProposalResult {
  PASSED = 'passed',
  FAILED = 'failed',
  INVALID = 'invalid'
}

export enum PrivacyLevel {
  PRIVATE = 'private',
  FAMILY = 'family',
  COMMUNITY = 'community',
  PUBLIC = 'public'
}

export enum FamilyDocumentType {
  PHOTO = 'photo',
  CERTIFICATE = 'certificate',
  LETTER = 'letter',
  STORY = 'story',
  OTHER = 'other'
}

export enum AccessLevel {
  OWNER = 'owner',
  FAMILY = 'family',
  VIEWER = 'viewer'
}

export enum ProductCategory {
  FOOD = 'food',
  CLOTHING = 'clothing',
  BOOKS = 'books',
  JUDAICA = 'judaica',
  SERVICES = 'services',
  OTHER = 'other'
}

export enum KosherStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  NOT_APPLICABLE = 'not_applicable'
}

export enum ListingStatus {
  ACTIVE = 'active',
  SOLD = 'sold',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended'
}

export enum EscrowStatus {
  CREATED = 'created',
  FUNDED = 'funded',
  EXECUTED = 'executed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed'
}

export interface Relationship {
  type: 'parent' | 'child' | 'spouse' | 'sibling';
  memberId: string;
  metadata?: Record<string, unknown>;
}
