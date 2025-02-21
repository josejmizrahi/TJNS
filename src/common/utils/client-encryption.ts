import crypto from 'crypto';

/**
 * Server-side encryption utilities for sensitive data
 */
export class ClientEncryption {
  private static async generateKey(): Promise<Buffer> {
    return crypto.randomBytes(32);
  }

  private static async exportKey(key: Buffer): Promise<string> {
    return key.toString('base64');
  }

  private static async importKey(keyData: string): Promise<Buffer> {
    return Buffer.from(keyData, 'base64');
  }

  static async encryptData(data: string): Promise<{ encrypted: string; key: string }> {
    const key = await this.generateKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const authTag = cipher.getAuthTag();

    const exportedKey = await this.exportKey(key);
    const ivBase64 = iv.toString('base64');
    const authTagBase64 = authTag.toString('base64');

    return {
      encrypted: `${encrypted}.${ivBase64}.${authTagBase64}`,
      key: exportedKey
    };
  }

  static async decryptData(encrypted: string, keyData: string): Promise<string> {
    const [encryptedData, ivBase64, authTagBase64] = encrypted.split('.');
    const key = await this.importKey(keyData);
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
