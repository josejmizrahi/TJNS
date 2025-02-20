import { SupabaseStorageAdapter } from '../adapters/storage.adapter';
import { IPFSService } from './ipfs';
import { EncryptionService } from './encryption';
import { AppError } from '../middleware/error';
import type { StorageAdapter } from '../adapters/storage.adapter';

export enum StorageType {
  SUPABASE = 'supabase',
  IPFS = 'ipfs'
}

export interface StorageOptions {
  type?: StorageType;
  bucket?: string;
  encrypted?: boolean;
}

export class HybridStorageService {
  constructor(
    private supabaseStorage: StorageAdapter,
    private ipfs: IPFSService,
    private readonly encryption: EncryptionService
  ) {}

  async uploadFile(
    path: string,
    file: Buffer,
    options: StorageOptions = {}
  ): Promise<{ path: string; type: StorageType; tag?: string }> {
    const { type = StorageType.SUPABASE, bucket = 'default', encrypted = true } = options;

    try {
      if (type === StorageType.IPFS) {
        if (encrypted) {
          const { encrypted: encryptedData, key, iv } = await this.encryption.encrypt(file);
          const { cid } = await this.ipfs.uploadEncrypted(encryptedData.toString('base64'));
          return { path: cid, type: StorageType.IPFS, tag: `${key.toString('hex')}:${iv.toString('hex')}` };
        } else {
          const cid = await this.ipfs.uploadFile(file);
          return { path: cid, type: StorageType.IPFS };
        }
      } else {
        const filePath = await this.supabaseStorage.uploadFile(bucket, path, file);
        return { path: filePath, type: StorageType.SUPABASE };
      }
    } catch (error) {
      throw new AppError(500, `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async downloadFile(
    path: string,
    type: StorageType,
    options: { bucket?: string; tag?: string } = {}
  ): Promise<Buffer> {
    const { bucket = 'default', tag } = options;

    try {
      if (type === StorageType.IPFS) {
        if (tag) {
          const [keyHex, ivHex] = tag.split(':');
          const key = Buffer.from(keyHex, 'hex');
          const iv = Buffer.from(ivHex, 'hex');
          const encryptedContent = await this.ipfs.downloadEncrypted(path);
          const encryptedBuffer = Buffer.from(encryptedContent, 'base64');
          return this.encryption.decrypt(encryptedBuffer, key, iv);
        } else {
          return this.ipfs.downloadFile(path);
        }
      } else {
        return this.supabaseStorage.downloadFile(bucket, path);
      }
    } catch (error) {
      throw new AppError(500, `Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteFile(
    path: string,
    type: StorageType,
    options: { bucket?: string } = {}
  ): Promise<void> {
    const { bucket = 'default' } = options;

    try {
      if (type === StorageType.SUPABASE) {
        await this.supabaseStorage.deleteFile(bucket, path);
      }
      // Note: IPFS files cannot be deleted, they can only become unreferenced
    } catch (error) {
      throw new AppError(500, `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getPublicUrl(
    path: string,
    type: StorageType,
    options: { bucket?: string } = {}
  ): string {
    const { bucket = 'default' } = options;

    if (type === StorageType.IPFS) {
      return this.ipfs.getGatewayUrl(path);
    } else {
      return this.supabaseStorage.getPublicUrl(bucket, path);
    }
  }

  // Helper methods for specific document types
  async uploadKYCDocument(
    userId: string,
    documentType: string,
    file: Buffer
  ): Promise<{ path: string; type: StorageType }> {
    // KYC documents go to Supabase Storage for better access control
    return this.uploadFile(
      `kyc/${userId}/${documentType}_${Date.now()}`,
      file,
      {
        type: StorageType.SUPABASE,
        bucket: 'documents',
        encrypted: true
      }
    );
  }

  async uploadFamilyDocument(
    treeId: string,
    memberId: string,
    documentType: string,
    file: Buffer
  ): Promise<{ path: string; type: StorageType; tag?: string }> {
    // Family/genealogical documents go to IPFS for permanence
    return this.uploadFile(
      `genealogy/${treeId}/${memberId}/${documentType}_${Date.now()}`,
      file,
      {
        type: StorageType.IPFS,
        encrypted: true
      }
    );
  }
}

export default new HybridStorageService(
  new SupabaseStorageAdapter(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  ),
  new IPFSService(),
  encryptionService
);
