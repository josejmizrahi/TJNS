import rateLimit from 'express-rate-limit';

// Rate limit for verification attempts (5 attempts per 15 minutes)
export const verificationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many verification attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limit for document uploads (10 uploads per hour)
export const documentRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many document uploads. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limit for MFA attempts (3 attempts per 5 minutes)
export const mfaRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3,
  message: 'Too many MFA attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
