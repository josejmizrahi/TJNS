import crypto from 'crypto';
import { securityConfig } from '../config/security';
import { auditLogger, AuditEventType } from './audit';

interface EncryptionKey {
  key: Buffer;
  createdAt: Date;
  id: string;
}

export class EncryptionService {
  private static instance: EncryptionService;
  private currentKey: EncryptionKey;
  private oldKeys: Map<string, EncryptionKey>;
  private readonly KEY_ROTATION_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly key: Buffer;
  private readonly iv: Buffer;

  private constructor() {
    if (!process.env.ENCRYPTION_KEY || !process.env.ENCRYPTION_IV) {
      throw new Error('Encryption key and IV must be set');
    }

    this.key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    this.iv = Buffer.from(process.env.ENCRYPTION_IV, 'hex');
    this.oldKeys = new Map();
    this.currentKey = {
      key: crypto.randomBytes(32),
      createdAt: new Date(),
      id: crypto.randomBytes(16).toString('hex')
    };
  }

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  private generateNewKey(): EncryptionKey {
    return {
      key: crypto.randomBytes(32),
      createdAt: new Date(),
      id: crypto.randomBytes(16).toString('hex')
    };
  }

  private rotateKeyIfNeeded(): void {
    const now = new Date();
    if (now.getTime() - this.currentKey.createdAt.getTime() >= this.KEY_ROTATION_INTERVAL) {
      // Store old key for decryption of existing data
      this.oldKeys.set(this.currentKey.id, this.currentKey);
      
      // Generate new key
      this.currentKey = this.generateNewKey();
      
      auditLogger.logEvent({
        type: AuditEventType.KEY_ROTATION,
        userId: 'system',
        action: 'rotate_encryption_key',
        status: 'success',
        timestamp: now
      });

      // Remove keys older than 7 days
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      for (const [id, key] of this.oldKeys.entries()) {
        if (key.createdAt < sevenDaysAgo) {
          this.oldKeys.delete(id);
        }
      }
    }
  }

  generateTag(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  encrypt(data: string, userId: string): { encryptedData: string; tag: string; keyId: string } {
    this.rotateKeyIfNeeded();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      securityConfig.encryption.algorithm,
      this.currentKey.key,
      iv
    ) as crypto.CipherGCM;

    let encryptedData = cipher.update(data, 'utf8', 'hex');
    encryptedData += cipher.final('hex');
    
    auditLogger.logEvent({
      type: AuditEventType.DOCUMENT_ACCESS,
      userId,
      action: 'encrypt_document',
      status: 'success'
    });

    return {
      encryptedData,
      tag: cipher.getAuthTag().toString('hex'),
      keyId: this.currentKey.id
    };
  }

  decrypt(encryptedData: string, tag: string, keyId: string, userId: string): string {
    const key = keyId === this.currentKey.id ? this.currentKey : this.oldKeys.get(keyId);
    if (!key) {
      throw new Error('Encryption key not found');
    }

    const iv = crypto.randomBytes(16);
    const decipher = crypto.createDecipheriv(
      securityConfig.encryption.algorithm,
      key.key,
      iv
    ) as crypto.DecipherGCM;

    decipher.setAuthTag(Buffer.from(tag, 'hex'));

    let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');
    
    auditLogger.logEvent({
      type: AuditEventType.DOCUMENT_ACCESS,
      userId,
      action: 'decrypt_document',
      status: 'success'
    });

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

export const encryptionService = EncryptionService.getInstance();
