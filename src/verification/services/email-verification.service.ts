import { BaseVerificationService } from './base-verification.service';
import { auditLogger, AuditEventType } from '../../common/utils/audit';
import { HybridStorageService } from '../../common/utils/storage';
import { BlockchainService } from '../../common/utils/blockchain';
import { AppError } from '../../common/middleware/error';
import { DatabaseAdapter } from '../../common/adapters/database.adapter';
import { adapterFactory } from '../../common/adapters';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Buffer } from 'node:buffer';

import { BaseVerification } from '../types/base';

interface EmailVerification extends BaseVerification {
  email: string;
  code: string;
  attempts: number;
  expiresAt: Date;
  verifiedAt?: Date;
}

export class EmailVerificationService extends BaseVerificationService<EmailVerification> {
  private static instance: EmailVerificationService;
  private readonly CODE_EXPIRY = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_ATTEMPTS = 3;
  private database: DatabaseAdapter;

  private constructor(
    storageService: HybridStorageService,
    blockchainService: BlockchainService
  ) {
    super(storageService, blockchainService);
    this.database = adapterFactory.getDatabaseAdapter();
  }

  static getInstance(
    storageService: HybridStorageService,
    blockchainService: BlockchainService
  ): EmailVerificationService {
    if (!EmailVerificationService.instance) {
      EmailVerificationService.instance = new EmailVerificationService(
        storageService,
        blockchainService
      );
    }
    return EmailVerificationService.instance;
  }

  async sendVerificationEmail(userId: string, email: string): Promise<void> {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const now = new Date();

    this.verifications.set(email, {
      userId,
      email,
      code,
      attempts: 0,
      status: 'pending',
      verificationId: this.generateVerificationId('email'),
      createdAt: now,
      expiresAt: new Date(now.getTime() + this.CODE_EXPIRY)
    });

    // TODO: Integrate with email service provider
    // For now, log the code for testing
    auditLogger.logEvent({
      type: AuditEventType.VERIFICATION_ATTEMPT,
      userId,
      action: 'send_email_verification',
      status: 'success',
      metadata: {
        email,
        testCode: code // Remove in production
      }
    });
  }

  async verifyCode(email: string, code: string): Promise<boolean> {
    const verification = this.verifications.get(email);
    
    if (!verification) {
      throw new AppError(404, 'No verification attempt found for this email');
    }

    if (verification.attempts >= this.MAX_ATTEMPTS) {
      auditLogger.logEvent({
        type: AuditEventType.VERIFICATION_ATTEMPT,
        userId: verification.userId,
        action: 'verify_email_code',
        status: 'failure',
        metadata: {
          email,
          reason: 'max_attempts_exceeded'
        }
      });
      throw new AppError(400, 'Maximum verification attempts exceeded');
    }

    if (new Date() > verification.expiresAt) {
      auditLogger.logEvent({
        type: AuditEventType.VERIFICATION_ATTEMPT,
        userId: verification.userId,
        action: 'verify_email_code',
        status: 'failure',
        metadata: {
          email,
          reason: 'code_expired'
        }
      });
      throw new AppError(400, 'Verification code has expired');
    }

    verification.attempts++;
    this.verifications.set(email, verification);

    const isValid = verification.code === code;
    
    auditLogger.logEvent({
      type: AuditEventType.VERIFICATION_ATTEMPT,
      userId: verification.userId,
      action: 'verify_email_code',
      status: isValid ? 'success' : 'failure',
      metadata: { email }
    });

    if (isValid) {
      verification.verifiedAt = new Date();
      await this.database.updateUser(verification.userId, {
        emailVerified: true
      });
      this.verifications.delete(email);
    }

    return isValid;
  }

  async isEmailVerified(userId: string): Promise<boolean> {
    const user = await this.database.getUserById(userId);
    return user?.emailVerified || false;
  }
}

// Import default instances
import storage from '../../common/utils/storage';
import blockchain from '../../common/utils/blockchain';

export const emailVerificationService = EmailVerificationService.getInstance(
  storage,
  blockchain
);
