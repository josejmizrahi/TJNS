import { StorageService, StorageType } from '../types/storage';

export class StorageAdapter implements StorageService {
  async uploadFile(_path: string, _data: Buffer): Promise<{ path: string; type: StorageType }> {
    // Implementation will be added later
    return { path: _path, type: StorageType.LOCAL };
  }

  async downloadFile(_path: string): Promise<Buffer> {
    // Implementation will be added later
    return Buffer.from('');
  }
}
