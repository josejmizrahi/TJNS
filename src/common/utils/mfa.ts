import { createHash, randomBytes } from 'crypto';
import { authenticator } from 'otplib';
import { SupabaseAdapter } from '../adapters/supabase.adapter';

export class MFAService {
  static generateSecret(): string {
    return authenticator.generateSecret();
  }

  static generateTOTPUri(secret: string, email: string): string {
    return authenticator.keyuri(email, 'JewishNetworkState', secret);
  }

  static verifyTOTP(token: string, secret: string): boolean {
    try {
      return authenticator.verify({ token, secret });
    } catch {
      return false;
    }
  }

  static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  static hashBackupCodes(codes: string[]): string[] {
    return codes.map(code => 
      createHash('sha256').update(code).digest('hex')
    );
  }

  static verifyBackupCode(code: string, hashedCodes: string[]): boolean {
    const hashedCode = createHash('sha256').update(code).digest('hex');
    return hashedCodes.includes(hashedCode);
  }

  static async validateBackupCode(code: string, userId: string, database: SupabaseAdapter): Promise<boolean> {
    const user = await database.getUserById(userId);
    if (!user?.profile.mfaBackupCodes) {
      return false;
    }

    const hashedCode = createHash('sha256').update(code).digest('hex');
    const isValid = user.profile.mfaBackupCodes.includes(hashedCode);

    if (isValid) {
      // Remove used backup code
      const updatedCodes = user.profile.mfaBackupCodes.filter((c: string) => c !== hashedCode);
      await database.updateUser(userId, {
        profile: {
          ...user.profile,
          mfaBackupCodes: updatedCodes
        }
      });
    }

    return isValid;
  }
}
