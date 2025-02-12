import { DatabaseAdapter } from './database.adapter';
import { SupabaseAdapter } from './supabase.adapter';
import { IPFSService } from '../utils/ipfs';
import { EncryptionService } from '../utils/encryption';
import { HybridStorageService } from '../utils/storage';
import { SupabaseStorageAdapter } from './storage.adapter';

class AdapterFactory {
  private static instance: AdapterFactory;
  private databaseAdapter?: DatabaseAdapter;
  private ipfsService?: IPFSService;
  private encryptionService?: EncryptionService;
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
      this.ipfsService = new IPFSService();
    }
    return this.ipfsService!;
  }

  getEncryptionService(): EncryptionService {
    if (!this.encryptionService) {
      this.encryptionService = new EncryptionService();
    }
    return this.encryptionService!;
  }

  getStorageAdapter(): HybridStorageService {
    if (!this.storageAdapter) {
      this.storageAdapter = new HybridStorageService(
        new SupabaseStorageAdapter(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_ANON_KEY!
        ),
        this.getIPFSService(),
        this.getEncryptionService()
      );
    }
    return this.storageAdapter;
  }
}

export const adapterFactory = AdapterFactory.getInstance();
