import { StorageService, StorageType } from '../types/storage';

export class StorageAdapter implements StorageService {
  async uploadFile(path: string, data: Buffer): Promise<{ path: string; type: StorageType }> {
    // Implementation will be added later
    return { path, type: StorageType.LOCAL };
  }

  async downloadFile(path: string): Promise<Buffer> {
    // Implementation will be added later
    return Buffer.from('');
  }
}
