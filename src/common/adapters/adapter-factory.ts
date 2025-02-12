import { DatabaseAdapter } from './database.adapter';
import { SupabaseAdapter } from './supabase.adapter';
import { IPFSAdapter } from './ipfs.adapter';
import { EncryptionAdapter } from './encryption.adapter';
import { StorageService } from '../types/storage';
import { HybridStorageService } from '../utils/storage';
import { StorageAdapter } from './storage';

class AdapterFactory {
  private static instance: AdapterFactory;
  private databaseAdapter?: DatabaseAdapter;
  private ipfsAdapter?: IPFSAdapter;
  private encryptionAdapter?: EncryptionAdapter;
  private storageAdapter?: StorageService;

  private constructor() {}

  static getInstance(): AdapterFactory {
    if (!AdapterFactory.instance) {
      AdapterFactory.instance = new AdapterFactory();
    }
    return AdapterFactory.instance;
  }

  getDatabaseAdapter(): DatabaseAdapter {
    if (!this.databaseAdapter) {
      this.databaseAdapter = new SupabaseAdapter();
    }
    return this.databaseAdapter;
  }

  getIPFSAdapter(): IPFSAdapter {
    if (!this.ipfsAdapter) {
      this.ipfsAdapter = new IPFSAdapter();
    }
    return this.ipfsAdapter;
  }

  getEncryptionAdapter(): EncryptionAdapter {
    if (!this.encryptionAdapter) {
      this.encryptionAdapter = new EncryptionAdapter();
    }
    return this.encryptionAdapter;
  }

  getStorageAdapter(): StorageService {
    if (!this.storageAdapter) {
      this.storageAdapter = new HybridStorageService(
        new StorageAdapter(),
        this.getIPFSAdapter(),
        this.getEncryptionAdapter()
      );
    }
    return this.storageAdapter;
  }
}

export const adapterFactory = AdapterFactory.getInstance();
