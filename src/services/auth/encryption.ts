import crypto from 'crypto';
import { promisify } from 'util';

const algorithm = 'aes-256-gcm';
const randomBytes = promisify(crypto.randomBytes);

export interface EncryptedData {
  encryptedContent: string;
  iv: string;
  authTag: string;
}

export const encrypt = async (data: string, key: string): Promise<EncryptedData> => {
  const iv = await randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv);
  
  let encryptedContent = cipher.update(data, 'utf8', 'hex');
  encryptedContent += cipher.final('hex');
  
  return {
    encryptedContent,
    iv: iv.toString('hex'),
    authTag: cipher.getAuthTag().toString('hex'),
  };
};

export const decrypt = (
  encryptedData: EncryptedData,
  key: string
): string => {
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(key, 'hex'),
    Buffer.from(encryptedData.iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encryptedContent, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

export const generateEncryptionKey = async (): Promise<string> => {
  const key = await randomBytes(32);
  return key.toString('hex');
};
