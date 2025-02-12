import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export class EncryptionAdapter {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32;
  private ivLength = 16;
  private authTagLength = 16;

  constructor(private key: Buffer = randomBytes(32)) {}

  async encrypt(data: Buffer): Promise<{ encrypted: Buffer; tag: Buffer }> {
    const iv = randomBytes(this.ivLength);
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    
    const encrypted = Buffer.concat([iv, cipher.update(data), cipher.final()]);
    const tag = cipher.getAuthTag();

    return { encrypted, tag };
  }

  async decrypt(encrypted: Buffer, tag: Buffer): Promise<Buffer> {
    const iv = encrypted.slice(0, this.ivLength);
    const data = encrypted.slice(this.ivLength);
    
    const decipher = createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(tag);
    
    return Buffer.concat([decipher.update(data), decipher.final()]);
  }
}

export default new EncryptionAdapter();
