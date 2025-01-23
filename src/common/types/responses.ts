// API Response Types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Identity Responses
export interface UserResponse {
  id: string;
  email: string;
  role: string;
  verificationLevel: string;
  profile: {
    firstName: string;
    lastName: string;
    community?: string;
  };
  walletAddress?: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

// Token Responses
export interface BalanceResponse {
  currency: string;
  balance: string;
  trustLineStatus: string;
}

export interface TransactionResponse {
  id: string;
  type: string;
  amount: string;
  currency: string;
  status: string;
  timestamp: string;
  counterparty: {
    id: string;
    name: string;
  };
}

// Governance Responses
export interface ProposalResponse {
  id: string;
  title: string;
  description: string;
  author: {
    id: string;
    name: string;
  };
  status: string;
  votingPeriod: {
    start: string;
    end: string;
  };
  stats: {
    yes: number;
    no: number;
    abstain: number;
    participation: number;
  };
}

export interface VoteResponse {
  proposalId: string;
  choice: string;
  weight: number;
  timestamp: string;
}

// Genealogy Responses
export interface FamilyTreeResponse {
  id: string;
  name: string;
  description?: string;
  privacyLevel: string;
  memberCount: number;
  documentCount: number;
}

export interface FamilyMemberResponse {
  id: string;
  name: string;
  dateOfBirth?: string;
  dateOfDeath?: string;
  relationships: Array<{
    type: string;
    memberId: string;
    memberName: string;
  }>;
}

// Marketplace Responses
export interface ListingResponse {
  id: string;
  title: string;
  description: string;
  price: {
    amount: string;
    currency: string;
  };
  seller: {
    id: string;
    name: string;
    rating: number;
  };
  category: string;
  kosherStatus: string;
  status: string;
}

export interface EscrowResponse {
  id: string;
  listing: {
    id: string;
    title: string;
  };
  amount: string;
  currency: string;
  status: string;
  buyer: {
    id: string;
    name: string;
  };
  seller: {
    id: string;
    name: string;
  };
  createdAt: string;
  expiresAt: string;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Error Responses
export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  code: string;
  message: string;
  errors?: ValidationError[];
  stack?: string;
}
