import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { storageConfig } from '../config/storage';

export class EncryptionService {
  private readonly algorithm: string;
  private readonly keyLength: number;

  constructor() {
    this.algorithm = storageConfig.encryption.algorithm;
    this.keyLength = storageConfig.encryption.keyLength;
  }

  async encrypt(data: Buffer): Promise<{ encrypted: Buffer; key: Buffer; iv: Buffer }> {
    const key = randomBytes(this.keyLength);
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, key, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(data),
      cipher.final()
    ]);

    return { encrypted, key, iv };
  }

  async decrypt(encrypted: Buffer, key: Buffer, iv: Buffer): Promise<Buffer> {
    const decipher = createDecipheriv(this.algorithm, key, iv);
    
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
  }

  // Key rotation methods
  async rotateKey(data: Buffer, oldKey: Buffer, oldIv: Buffer): Promise<{ encrypted: Buffer; key: Buffer; iv: Buffer }> {
    const decrypted = await this.decrypt(data, oldKey, oldIv);
    return this.encrypt(decrypted);
  }
}

// Export a singleton instance
const encryptionService = new EncryptionService();
export default encryptionService;
