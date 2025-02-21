# Rate Limiting Implementation

The JewishID system implements rate limiting to prevent abuse and ensure system stability:

## Verification Rate Limits
- Email verification: 5 attempts per 15 minutes
- Document uploads: 10 uploads per hour
- MFA verification: 3 attempts per 5 minutes

## Implementation Details
Rate limiting is implemented using express-rate-limit middleware:

```typescript
// Rate limit for verification attempts
export const verificationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5
});

// Rate limit for document uploads
export const documentRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10
});

// Rate limit for MFA attempts
export const mfaRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3
});
```

## Protected Routes
- `/verify-email`: Limited to 5 attempts per 15 minutes
- `/documents`: Limited to 10 uploads per hour
- `/mfa/verify`: Limited to 3 attempts per 5 minutes

## Audit Logging
All rate-limited endpoints are monitored through comprehensive audit logging:
- Successful and failed attempts are logged
- IP addresses and user IDs are recorded
- Timestamps and rate limit status are tracked

## Security Considerations
- Rate limits are enforced per IP address
- Failed attempts are logged for security monitoring
- Audit logs are stored securely and encrypted
