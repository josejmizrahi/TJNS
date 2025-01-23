import { SupabaseClient } from '@supabase/supabase-js';
import { EncryptionService } from '../utils/encryption';

export interface StorageAdapter {
  uploadFile(bucket: string, path: string, file: Buffer): Promise<string>;
  downloadFile(bucket: string, path: string): Promise<Buffer>;
  deleteFile(bucket: string, path: string): Promise<void>;
  getPublicUrl(bucket: string, path: string): string;
}

export class SupabaseStorageAdapter implements StorageAdapter {
  private client: SupabaseClient;
  private encryption: EncryptionService;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.client = new SupabaseClient(supabaseUrl, supabaseKey);
    this.encryption = new EncryptionService();
  }

  async uploadFile(bucket: string, path: string, file: Buffer): Promise<string> {
    // Encrypt sensitive files before upload
    const { encryptedData, tag } = this.encryption.encrypt(file.toString('base64'));
    
    const { data, error } = await this.client
      .storage
      .from(bucket)
      .upload(`${path}_${tag}`, Buffer.from(encryptedData));

    if (error) throw error;
    return data.path;
  }

  async downloadFile(bucket: string, path: string): Promise<Buffer> {
    // Extract encryption tag from path
    const [, tag] = path.split('_');
    
    const { data, error } = await this.client
      .storage
      .from(bucket)
      .download(path);

    if (error) throw error;

    // Decrypt the downloaded file
    const encryptedContent = await data.text();
    const decryptedContent = this.encryption.decrypt(encryptedContent, tag);
    return Buffer.from(decryptedContent, 'base64');
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await this.client
      .storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.client
      .storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  // Helper methods for specific document types
  async uploadKYCDocument(userId: string, documentType: string, file: Buffer): Promise<string> {
    const path = `kyc/${userId}/${documentType}_${Date.now()}`;
    return this.uploadFile('documents', path, file);
  }

  async uploadFamilyDocument(treeId: string, memberId: string, documentType: string, file: Buffer): Promise<string> {
    const path = `genealogy/${treeId}/${memberId}/${documentType}_${Date.now()}`;
    return this.uploadFile('documents', path, file);
  }
}
