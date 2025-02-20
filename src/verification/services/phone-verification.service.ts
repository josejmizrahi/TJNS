import { auditLogger, AuditEventType } from '../../common/utils/audit';

interface PhoneVerificationAttempt {
  phoneNumber: string;
  code: string;
  createdAt: Date;
  expiresAt: Date;
  attempts: number;
}

export class PhoneVerificationService {
  private static instance: PhoneVerificationService;
  private verificationAttempts: Map<string, PhoneVerificationAttempt>;
  private readonly CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes
  private readonly MAX_ATTEMPTS = 3;

  private constructor() {
    this.verificationAttempts = new Map();
  }

  static getInstance(): PhoneVerificationService {
    if (!PhoneVerificationService.instance) {
      PhoneVerificationService.instance = new PhoneVerificationService();
    }
    return PhoneVerificationService.instance;
  }

  async sendVerificationCode(phoneNumber: string, userId: string): Promise<void> {
    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const now = new Date();

    this.verificationAttempts.set(phoneNumber, {
      phoneNumber,
      code,
      createdAt: now,
      expiresAt: new Date(now.getTime() + this.CODE_EXPIRY),
      attempts: 0
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
    const attempt = this.verificationAttempts.get(phoneNumber);
    
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
    this.verificationAttempts.set(phoneNumber, attempt);

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
      this.verificationAttempts.delete(phoneNumber);
    }

    return isValid;
  }
}

export const phoneVerificationService = PhoneVerificationService.getInstance();
