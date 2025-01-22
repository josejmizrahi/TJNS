import { Document, Schema, model } from 'mongoose';

export interface IUser extends Document {
  jewishId: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  status: 'pending' | 'active' | 'suspended';
  kycStatus: 'not_started' | 'pending' | 'approved' | 'rejected';
  xrplAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    jewishId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended'],
      default: 'pending',
    },
    kycStatus: {
      type: String,
      enum: ['not_started', 'pending', 'approved', 'rejected'],
      default: 'not_started',
    },
    xrplAddress: {
      type: String,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for frequently queried fields
UserSchema.index({ email: 1 });
UserSchema.index({ jewishId: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ kycStatus: 1 });

export const User = model<IUser>('User', UserSchema);
