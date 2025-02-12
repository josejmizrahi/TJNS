import { Pool } from 'pg';
import { IPFSHTTPClient } from 'ipfs-http-client';

export interface IPFSConfig {
  url: string;
}

export interface StorageMetadata {
  ipfsHash: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface IStorageService {
  store(path: string, data: Record<string, any>): Promise<void>;
  retrieve(path: string): Promise<Record<string, any> | null>;
}
