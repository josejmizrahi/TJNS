import { config } from './app';

export interface StorageConfig {
  ipfs: {
    host: string;
    port: number;
    protocol: string;
  };
  encryption: {
    algorithm: string;
    keyLength: number;
  };
}

export const storageConfig: StorageConfig = {
  ipfs: config.storage.ipfs,
  encryption: config.encryption
};
