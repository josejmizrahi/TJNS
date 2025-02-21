import { BaseVerificationService } from './base-verification.service';
import { PhoneVerification } from '../types/models';
import { auditLogger, AuditEventType } from '../../common/utils/audit';
import { HybridStorageService } from '../../common/utils/storage';
import { BlockchainService } from '../../common/utils/blockchain';

export class PhoneVerificationService extends BaseVerificationService<PhoneVerification> {
  private static instance: PhoneVerificationService;
  private readonly CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes
  private readonly MAX_ATTEMPTS = 3;

  private constructor(
    storageService: HybridStorageService,
    blockchainService: BlockchainService
  ) {
    super(storageService, blockchainService);
    // Initialize base class
  }

  static getInstance(
    storageService: HybridStorageService,
    blockchainService: BlockchainService
  ): PhoneVerificationService {
    if (!PhoneVerificationService.instance) {
      PhoneVerificationService.instance = new PhoneVerificationService(
        storageService,
        blockchainService
      );
    }
    return PhoneVerificationService.instance;
  }

  async sendVerificationCode(phoneNumber: string, userId: string): Promise<void> {
    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const now = new Date();

    this.verifications.set(phoneNumber, {
      userId,
      verificationId: this.generateVerificationId('phone'),
      status: 'pending',
      phoneNumber,
      code,
      attempts: 0,
      createdAt: now,
      expiresAt: new Date(now.getTime() + this.CODE_EXPIRY)
    });

    // TODO: Integrate with SMS provider (Twilio/MessageBird)
    // For now, log the code for testing
    auditLogger.logEvent({
      type: AuditEventType.VERIFICATION_ATTEMPT,
      userId,
      action: 'send_phone_verification',
      status: 'success',
      metadata: {
        phoneNumber,
        testCode: code // Remove in production
      }
    });
  }

  async verifyCode(phoneNumber: string, code: string, userId: string): Promise<boolean> {
    const attempt = this.verifications.get(phoneNumber);
    
    if (!attempt) {
      throw new Error('No verification attempt found for this phone number');
    }

    if (attempt.attempts >= this.MAX_ATTEMPTS) {
      auditLogger.logEvent({
        type: AuditEventType.VERIFICATION_ATTEMPT,
        userId,
        action: 'verify_phone_code',
        status: 'failure',
        metadata: {
          phoneNumber,
          reason: 'max_attempts_exceeded'
        }
      });
      throw new Error('Maximum verification attempts exceeded');
    }

    if (new Date() > attempt.expiresAt) {
      auditLogger.logEvent({
        type: AuditEventType.VERIFICATION_ATTEMPT,
        userId,
        action: 'verify_phone_code',
        status: 'failure',
        metadata: {
          phoneNumber,
          reason: 'code_expired'
        }
      });
      throw new Error('Verification code has expired');
    }

    attempt.attempts++;
    this.verifications.set(phoneNumber, attempt);

    const isValid = attempt.code === code;
    
    auditLogger.logEvent({
      type: AuditEventType.VERIFICATION_ATTEMPT,
      userId,
      action: 'verify_phone_code',
      status: isValid ? 'success' : 'failure',
      metadata: {
        phoneNumber
      }
    });

    if (isValid) {
      this.verifications.delete(phoneNumber);
    }

    return isValid;
  }
}

import storage from '../../common/utils/storage';
import blockchain from '../../common/utils/blockchain';

export const phoneVerificationService = PhoneVerificationService.getInstance(
  storage,
  blockchain
);
