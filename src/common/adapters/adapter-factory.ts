import { DatabaseAdapter } from './database.adapter';
import { SupabaseAdapter } from './supabase.adapter';
import { IPFSAdapter, IPFSService } from './ipfs.adapter';
import { EncryptionAdapter } from './encryption.adapter';
import { StorageType } from '../types/storage';
import { HybridStorageService, StorageOptions } from '../utils/storage';
import { SupabaseStorageAdapter } from './storage.adapter';

class AdapterFactory {
  private static instance: AdapterFactory;
  private databaseAdapter?: DatabaseAdapter;
  private ipfsAdapter?: IPFSAdapter;
  private encryptionAdapter?: EncryptionAdapter;
  private storageAdapter?: HybridStorageService;

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

  getStorageAdapter(): HybridStorageService {
    if (!this.storageAdapter) {
      this.storageAdapter = new HybridStorageService(
        new SupabaseStorageAdapter(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_ANON_KEY!
        ),
        this.getIPFSAdapter(),
        this.getEncryptionAdapter()
      );
    }
    return this.storageAdapter;
  }
}

export const adapterFactory = AdapterFactory.getInstance();
