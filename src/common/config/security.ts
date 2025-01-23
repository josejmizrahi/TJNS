import crypto from 'crypto';

export const securityConfig = {
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    saltLength: 64,
    tagLength: 16,
    iterations: 100000,
    digest: 'sha512',
  },

  passwords: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },

  sessions: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
};

export const generateEncryptionKey = () => {
  return crypto.randomBytes(securityConfig.encryption.keyLength);
};

export const generateIV = () => {
  return crypto.randomBytes(securityConfig.encryption.ivLength);
};

export default securityConfig;
