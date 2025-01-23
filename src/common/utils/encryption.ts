import crypto from 'crypto';
import { securityConfig } from '../config/security';

export class EncryptionService {
  private readonly key: Buffer;
  private readonly iv: Buffer;

  constructor() {
    if (!process.env.ENCRYPTION_KEY || !process.env.ENCRYPTION_IV) {
      throw new Error('Encryption key and IV must be set');
    }

    this.key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    this.iv = Buffer.from(process.env.ENCRYPTION_IV, 'hex');
  }

  encrypt(data: string): { encryptedData: string; tag: string } {
    const cipher = crypto.createCipheriv(
      securityConfig.encryption.algorithm,
      this.key,
      this.iv
    ) as crypto.CipherGCM;

    let encryptedData = cipher.update(data, 'utf8', 'hex');
    encryptedData += cipher.final('hex');
    
    return {
      encryptedData,
      tag: cipher.getAuthTag().toString('hex'),
    };
  }

  decrypt(encryptedData: string, tag: string): string {
    const decipher = crypto.createDecipheriv(
      securityConfig.encryption.algorithm,
      this.key,
      this.iv
    ) as crypto.DecipherGCM;

    decipher.setAuthTag(Buffer.from(tag, 'hex'));

    let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');
    
    return decryptedData;
  }

  static hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(16).toString('hex');
      
      crypto.pbkdf2(
        password,
        salt,
        securityConfig.encryption.iterations,
        64,
        securityConfig.encryption.digest,
        (err, derivedKey) => {
          if (err) reject(err);
          resolve(salt + ':' + derivedKey.toString('hex'));
        }
      );
    });
  }

  static verifyPassword(password: string, hash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const [salt, key] = hash.split(':');
      
      crypto.pbkdf2(
        password,
        salt,
        securityConfig.encryption.iterations,
        64,
        securityConfig.encryption.digest,
        (err, derivedKey) => {
          if (err) reject(err);
          resolve(key === derivedKey.toString('hex'));
        }
      );
    });
  }
}

export default new EncryptionService();
