# Multi-Factor Authentication Implementation

The JewishID system enforces MFA for all sensitive operations to ensure security:

## Protected Operations
- Document uploads and verification
- Identity verification level changes
- Family tree modifications
- KYC/AML submissions
- Wallet operations

## Implementation Details
MFA is enforced through middleware:

```typescript
export const requireMFA = async (req: Request, res: Response, next: NextFunction) => {
  const user = await database.getUserById(req.user?.id);
  if (!user?.profile?.mfaEnabled || !user?.profile?.mfaVerified) {
    throw new AppError(403, 'MFA verification required');
  }
  next();
};
```

## Security Considerations
- MFA is required for all sensitive operations
- TOTP-based authentication with backup codes
- Rate limiting on MFA verification attempts
- Audit logging for MFA-related events
- Secure key storage and rotation

## Protected Routes
All routes under:
- `/documents/*`
- `/verify/*`
- `/jewish-identity/*`
- `/wallet/*`
