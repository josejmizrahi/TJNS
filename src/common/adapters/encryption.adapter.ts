import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export class EncryptionAdapter {
  private algorithm = 'aes-256-cbc';
  private keyLength = 32;
  private ivLength = 16;
  private authTagLength = 16;

  constructor(private key: Buffer = randomBytes(32)) {}

  async encrypt(data: Buffer): Promise<Buffer> {
    const iv = randomBytes(this.ivLength);
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    
    return Buffer.concat([iv, cipher.update(data), cipher.final()]);
  }

  async decrypt(encrypted: Buffer): Promise<Buffer> {
    const iv = encrypted.slice(0, this.ivLength);
    const data = encrypted.slice(this.ivLength);
    
    const decipher = createDecipheriv(this.algorithm, this.key, iv);
    return Buffer.concat([decipher.update(data), decipher.final()]);
  }
}

export default new EncryptionAdapter();
