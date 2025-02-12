import { DatabaseAdapter } from './database.adapter';
import { SupabaseAdapter } from './supabase.adapter';
import { IPFSService, IPFSServiceImpl } from '../utils/ipfs';
import { EncryptionAdapter } from './encryption.adapter';
import { StorageType } from '../types/storage';
import { HybridStorageService, StorageOptions } from '../utils/storage';
import { SupabaseStorageAdapter } from './storage.adapter';

class AdapterFactory {
  private static instance: AdapterFactory;
  private databaseAdapter?: DatabaseAdapter;
  private ipfsService?: IPFSService;
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

  getIPFSService(): IPFSService {
    if (!this.ipfsService) {
      this.ipfsService = new IPFSServiceImpl();
    }
    return this.ipfsService;
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
        this.getIPFSService(),
        this.getEncryptionAdapter()
      );
    }
    return this.storageAdapter;
  }
}

export const adapterFactory = AdapterFactory.getInstance();
