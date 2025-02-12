import { createHash } from 'crypto';
import { create as createIPFS } from 'ipfs-http-client';
import { HybridStorageService } from '../../common/utils/storage';
import { IPFSConfig, StorageMetadata, IStorageService } from '../types';

export class MarketplaceStorageService {
  private ipfs: IPFSHTTPClient;
  private storage: IStorageService;

  constructor() {
    this.ipfs = createIPFS({ url: process.env.IPFS_NODE_URL || 'http://localhost:5001' });
    this.storage = new HybridStorageService();
  }

  async uploadListingImage(listingId: string, imageBuffer: Buffer, mimeType: string): Promise<string> {
    const hash = createHash('sha256').update(imageBuffer).digest('hex');
    const path = `listings/${listingId}/images/${hash}`;
    
    // Store in IPFS
    const result = await this.ipfs.add(imageBuffer);
    const ipfsHash = result.cid.toString();

    // Store metadata in hybrid storage
    await this.storage.store(path, {
      ipfsHash,
      mimeType,
      size: imageBuffer.length,
      uploadedAt: new Date().toISOString()
    });

    return path;
  }

  async getListingImage(path: string): Promise<Buffer> {
    const metadata = await this.storage.retrieve(path);
    if (!metadata?.ipfsHash) {
      throw new Error('Image not found');
    }

    // Retrieve from IPFS
    const chunks: Uint8Array[] = [];
    for await (const chunk of this.ipfs.cat(metadata.ipfsHash)) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  }
}
