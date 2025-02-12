import { createHash } from 'crypto';
import { HybridStorageService, StorageType } from '../../common/utils/storage';

export class MarketplaceStorageService {
  constructor(private storage: HybridStorageService) {}

  async uploadListingImage(listingId: string, imageBuffer: Buffer, _mimeType: string): Promise<{ path: string; type: StorageType }> {
    const hash = createHash('sha256').update(imageBuffer).digest('hex');
    const path = `listings/${listingId}/images/${hash}`;
    
    return this.storage.uploadFile(path, imageBuffer, {
      type: StorageType.IPFS,
      encrypted: true
    });
  }

  async getListingImage(path: string, type: StorageType): Promise<Buffer> {
    return this.storage.downloadFile(path, type);
  }
}
