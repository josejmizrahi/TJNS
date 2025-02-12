import { IPFSHTTPClient, create } from 'ipfs-http-client';
import { StorageType } from '../types/storage';

export interface IPFSService {
  addFile(data: Buffer): Promise<string>;
  getFile(cid: string): Promise<Buffer>;
}

export class IPFSAdapter implements IPFSService {
  private client: IPFSHTTPClient;

  constructor() {
    this.client = create({ url: process.env.IPFS_NODE_URL || 'http://localhost:5001' });
  }

  async addFile(data: Buffer): Promise<string> {
    const result = await this.client.add(data);
    return result.path;
  }

  async getFile(cid: string): Promise<Buffer> {
    const chunks: Uint8Array[] = [];
    for await (const chunk of this.client.cat(cid)) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }
}

export default new IPFSAdapter();
