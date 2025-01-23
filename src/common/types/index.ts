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
  filters?: Record<string, any>;
}

// Common Types
export type UUID = string;
export type ISODateTime = string;
export type BlockchainAddress = string;
export type IPFSHash = string;

// Utility Types
export type Optional<T> = T | undefined;
export type Nullable<T> = T | null;
export type AsyncResponse<T> = Promise<ApiResponse<T>>;

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
export interface Event<T = any> {
  type: string;
  payload: T;
  timestamp: Date;
  userId?: string;
}

// Queue Types
export interface QueueMessage<T = any> {
  id: string;
  type: string;
  data: T;
  attempts: number;
  createdAt: Date;
}
