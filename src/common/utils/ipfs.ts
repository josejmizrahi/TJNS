import { create, IPFSHTTPClient } from 'ipfs-http-client';
import { EncryptionService } from './encryption';

export class IPFSService {
  private client: IPFSHTTPClient;
  private encryption: EncryptionService;

  constructor() {
    this.client = create({ url: process.env.IPFS_NODE });
    this.encryption = new EncryptionService();
  }

  async uploadEncrypted(data: string): Promise<{ cid: string; keyId: string }> {
    const { encrypted, keyId } = await this.encryption.encrypt(Buffer.from(data));
    const result = await this.client.add(encrypted);
    
    return {
      cid: result.path,
      keyId,
    };
  }

  async downloadEncrypted(cid: string, keyId: string): Promise<string> {
    const chunks = [];
    for await (const chunk of this.client.cat(cid)) {
      chunks.push(chunk);
    }
    
    const encryptedData = Buffer.concat(chunks);
    const { key, iv } = this.encryption.getCurrentKey();
    const decrypted = await this.encryption.decrypt(encryptedData, key, iv, keyId);
    return decrypted.toString();
  }

  async uploadFile(file: Buffer): Promise<string> {
    const result = await this.client.add(file);
    return result.path;
  }

  async downloadFile(cid: string): Promise<Buffer> {
    const chunks = [];
    for await (const chunk of this.client.cat(cid)) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  getGatewayUrl(cid: string): string {
    return `${process.env.IPFS_GATEWAY}/ipfs/${cid}`;
  }
}

export default new IPFSService();
