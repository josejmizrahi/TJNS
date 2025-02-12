export interface Escrow {
  id: string;
  transactionId: string;
  buyerId: string;
  sellerId: string;
  amount: string;
  status: 'pending' | 'released' | 'refunded' | 'disputed';
  createdAt: Date;
  updatedAt: Date;
}
