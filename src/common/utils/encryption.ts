import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { storageConfig } from '../config/storage';
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
  private readonly algorithm: string;
  private readonly KEY_LENGTH = 32; // AES-256 key length in bytes

  private constructor() {
    this.algorithm = storageConfig.encryption.algorithm;
    this.oldKeys = new Map();
    this.currentKey = this.generateNewKey();
  }

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  private generateNewKey(): EncryptionKey {
    return {
      key: randomBytes(this.KEY_LENGTH),
      createdAt: new Date(),
      id: randomBytes(16).toString('hex')
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
        metadata: {
          timestamp: now.toISOString()
        }
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

  async encrypt(data: Buffer): Promise<{ encrypted: Buffer; key: Buffer; iv: Buffer; keyId: string }> {
    this.rotateKeyIfNeeded();
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.currentKey.key, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(data),
      cipher.final()
    ]);

    return { 
      encrypted, 
      key: this.currentKey.key, 
      iv,
      keyId: this.currentKey.id
    };
  }

  async decrypt(encrypted: Buffer, key: Buffer, iv: Buffer, keyId?: string): Promise<Buffer> {
    // If keyId is provided, try to use the specific key
    if (keyId) {
      const specificKey = keyId === this.currentKey.id ? 
        this.currentKey.key : 
        this.oldKeys.get(keyId)?.key;
      
      if (specificKey) {
        key = specificKey;
      }
    }

    const decipher = createDecipheriv(this.algorithm, key, iv);
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
  }

  // Key rotation methods
  async rotateKey(data: Buffer, oldKey: Buffer, oldIv: Buffer): Promise<{ encrypted: Buffer; key: Buffer; iv: Buffer; keyId: string }> {
    const decrypted = await this.decrypt(data, oldKey, oldIv);
    return this.encrypt(decrypted);
  }
}

export const encryptionService = EncryptionService.getInstance();
