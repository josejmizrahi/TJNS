import { TokenType } from '../../blockchain/types';
import { EscrowStatus } from '../../blockchain/types';

export interface Escrow {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: string;
  currency: TokenType;
  status: EscrowStatus;
  expiresAt: Date;
  metadata?: Record<string, unknown>;
}
