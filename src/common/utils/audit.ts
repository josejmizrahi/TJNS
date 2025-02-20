import winston from 'winston';

export enum AuditEventType {
  VERIFICATION_ATTEMPT = 'verification_attempt',
  DOCUMENT_ACCESS = 'document_access',
  MFA_SETUP = 'mfa_setup',
  MFA_VERIFICATION = 'mfa_verification',
  KEY_ROTATION = 'key_rotation',
  DOCUMENT_REVOCATION = 'document_revocation'
}

export interface AuditEvent {
  type: AuditEventType;
  userId: string;
  action: string;
  status: 'success' | 'failure';
  metadata?: Record<string, unknown>;
  timestamp?: Date;
}

class AuditLogger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'audit.log' }),
        new winston.transports.Console()
      ]
    });
  }

  logEvent(event: AuditEvent): void {
    this.logger.info('Security Event', {
      ...event,
      timestamp: event.timestamp || new Date()
    });
  }
}

export const auditLogger = new AuditLogger();
