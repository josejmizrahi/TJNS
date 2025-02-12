export interface StorageMetadata {
  ipfsHash: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export enum StorageType {
  LOCAL = 'local',
  IPFS = 'ipfs',
  S3 = 's3'
}

export interface IPFSService {
  addFile(data: Buffer): Promise<string>;
  getFile(cid: string): Promise<Buffer>;
}

export interface StorageService {
  uploadFile(path: string, data: Buffer): Promise<{ path: string; type: StorageType }>;
  downloadFile(path: string): Promise<Buffer>;
}
