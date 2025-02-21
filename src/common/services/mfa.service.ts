import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { MFAConfig, TOTPToken, BackupCode } from '../types/mfa';

export class MFAService {
  private static instance: MFAService;
  private config: MFAConfig;

  private constructor() {
    this.config = {
      issuer: process.env.MFA_ISSUER || 'JewishNetworkState',
      secretKey: process.env.MFA_SECRET_KEY || '',
      algorithm: 'sha256',
      digits: 6,
      period: 30
    };
  }

  public static getInstance(): MFAService {
    if (!MFAService.instance) {
      MFAService.instance = new MFAService();
    }
    return MFAService.instance;
  }

  public generateSecret(): string {
    return speakeasy.generateSecret({
      length: 20,
      name: this.config.issuer
    }).base32;
  }

  public async generateQRCode(secret: string, email: string): Promise<string> {
    const otpauthUrl = speakeasy.otpauthURL({
      secret,
      label: email,
      issuer: this.config.issuer,
      algorithm: this.config.algorithm,
      digits: this.config.digits,
      period: this.config.period
    });

    return QRCode.toDataURL(otpauthUrl);
  }

  public verifyToken(token: string, secret: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      algorithm: this.config.algorithm,
      digits: this.config.digits,
      period: this.config.period
    });
  }

  public generateBackupCodes(count: number = 10): BackupCode[] {
    return Array.from({ length: count }, () => ({
      code: speakeasy.generateSecret({ length: 10 }).base32,
      used: false,
      createdAt: new Date()
    }));
  }
}
