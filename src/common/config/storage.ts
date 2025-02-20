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
  ipfs: {
    host: process.env.IPFS_HOST || 'ipfs.infura.io',
    port: parseInt(process.env.IPFS_PORT || '5001'),
    protocol: process.env.IPFS_PROTOCOL || 'https'
  },
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32
  }
};
