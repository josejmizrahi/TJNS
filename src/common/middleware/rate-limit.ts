import rateLimit from 'express-rate-limit';
import { auditLogger, AuditEventType } from '../utils/audit';

export const verificationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many verification attempts, please try again later',
  handler: (req, res, next) => {
    auditLogger.logEvent({
      type: AuditEventType.VERIFICATION_ATTEMPT,
      userId: req.user?.id || 'anonymous',
      action: 'rate_limit_exceeded',
      status: 'failure',
      metadata: {
        ip: req.ip,
        endpoint: req.originalUrl
      }
    });
    res.status(429).json({
      error: 'Too many verification attempts, please try again later'
    });
  }
});

export const mfaRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 attempts per window
  message: 'Too many MFA attempts, please try again later',
  handler: (req, res, next) => {
    auditLogger.logEvent({
      type: AuditEventType.MFA_VERIFICATION,
      userId: req.user?.id || 'anonymous',
      action: 'rate_limit_exceeded',
      status: 'failure',
      metadata: {
        ip: req.ip,
        endpoint: req.originalUrl
      }
    });
    res.status(429).json({
      error: 'Too many MFA attempts, please try again later'
    });
  }
});
