export * from './models';
export * from './responses';

// Request Types
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DateRangeParams {
  startDate?: Date;
  endDate?: Date;
}

export interface SearchParams {
  query?: string;
  filters?: Record<string, unknown>;
}

// Common Types
export type UUID = string;
export type ISODateTime = string;
export type BlockchainAddress = string;
export type IPFSHash = string;

// Utility Types
export type Optional<T> = T | undefined;
export type Nullable<T> = T | null;
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export type AsyncResponse<T> = Promise<ApiResponse<T>>;

// Supabase Types
export interface SupabaseAuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    role?: string;
    verification_level?: string;
  };
}

// Express Request augmentation
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        verificationLevel: VerificationLevel;
        email?: string;
      };
    }
  }
}

// Configuration Types
export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface BlockchainConfig {
  nodeUrl: string;
  coldWallet: string;
  hotWallet: string;
  tokens: {
    [key: string]: {
      currency: string;
      issuer: string;
    };
  };
}

export interface SecurityConfig {
  jwtSecret: string;
  jwtExpiration: string;
  encryptionKey: string;
  encryptionIv: string;
}

// Service Response Types
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
}

// Event Types
export interface Event<T = unknown> {
  type: string;
  payload: T;
  timestamp: Date;
  userId?: string;
}

// Queue Types
export interface QueueMessage<T = unknown> {
  id: string;
  type: string;
  data: T;
  attempts: number;
  createdAt: Date;
}
