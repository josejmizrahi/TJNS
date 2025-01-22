import { Document, Schema, model } from 'mongoose';

export interface IKycDocument extends Document {
  userId: Schema.Types.ObjectId;
  documentType: 'identity' | 'address_proof' | 'community_certificate';
  documentHash: string;  // IPFS hash or encrypted storage reference
  status: 'pending' | 'approved' | 'rejected';
  verifiedAt?: Date;
  verifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const KycDocumentSchema = new Schema<IKycDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      enum: ['identity', 'address_proof', 'community_certificate'],
      required: true,
    },
    documentHash: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    verifiedAt: Date,
    verifiedBy: String,
  },
  {
    timestamps: true,
  }
);

// Create compound index for efficient querying
KycDocumentSchema.index({ userId: 1, documentType: 1 });
KycDocumentSchema.index({ status: 1 });

export const KycDocument = model<IKycDocument>('KycDocument', KycDocumentSchema);
