import { SupabaseClient, createClient } from '@supabase/supabase-js';
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
    this.client = createClient(supabaseUrl, supabaseKey);
    this.encryption = EncryptionService.getInstance();
  }

  async uploadFile(bucket: string, path: string, file: Buffer): Promise<string> {
    // Encrypt sensitive files before upload
    const { encrypted, keyId } = await this.encryption.encrypt(file);
    
    const { data, error } = await this.client
      .storage
      .from(bucket)
      .upload(`${path}_${keyId}`, encrypted);

    if (error) throw error;
    return data.path;
  }

  async downloadFile(bucket: string, path: string): Promise<Buffer> {
    // Extract key ID from path
    const [, keyId] = path.split('_');
    
    const { data, error } = await this.client
      .storage
      .from(bucket)
      .download(path);

    if (error) throw error;

    // Get the encrypted content as a buffer
    const encryptedContent = Buffer.from(await data.arrayBuffer());
    
    // Get the current key and IV for decryption
    const { key, iv, keyId: currentKeyId } = this.encryption.getCurrentKey();
    
    // Decrypt the downloaded file using the key ID from the path
    return this.encryption.decrypt(encryptedContent, key, iv, keyId || currentKeyId);
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
