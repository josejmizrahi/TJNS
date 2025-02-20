import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { SupabaseAdapter } from './supabase.adapter';
import { SupabaseStorageAdapter } from './storage.adapter';
import { SupabaseRealtimeAdapter } from './realtime.adapter';
import { IPFSService } from '../utils/ipfs';
import { EncryptionService } from '../utils/encryption';

export class AdapterFactory {
  private static instance: AdapterFactory;
  private client: SupabaseClient | null = null;
  private databaseAdapter: SupabaseAdapter | null = null;
  private storageAdapter: SupabaseStorageAdapter | null = null;
  private realtimeAdapter: SupabaseRealtimeAdapter | null = null;
  private ipfsService: IPFSService | null = null;
  private encryptionService: EncryptionService | null = null;

  private constructor() {}

  static getInstance(): AdapterFactory {
    if (!AdapterFactory.instance) {
      AdapterFactory.instance = new AdapterFactory();
    }
    return AdapterFactory.instance;
  }

  initialize(supabaseUrl: string, supabaseKey: string) {
    if (!this.client) {
      this.client = createClient(supabaseUrl, supabaseKey);
      this.databaseAdapter = new SupabaseAdapter();
      this.storageAdapter = new SupabaseStorageAdapter(supabaseUrl, supabaseKey);
      this.realtimeAdapter = new SupabaseRealtimeAdapter(supabaseUrl, supabaseKey);
      this.ipfsService = new IPFSService();
      this.encryptionService = new EncryptionService();
    }
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

  getDatabaseAdapter(): SupabaseAdapter {
    if (!this.databaseAdapter) {
      throw new Error('AdapterFactory not initialized. Call initialize() first.');
    }
    return this.databaseAdapter;
  }

  getStorageAdapter(): SupabaseStorageAdapter {
    if (!this.storageAdapter) {
      throw new Error('AdapterFactory not initialized. Call initialize() first.');
    }
    return this.storageAdapter;
  }

  getRealtimeAdapter(): SupabaseRealtimeAdapter {
    if (!this.realtimeAdapter) {
      throw new Error('AdapterFactory not initialized. Call initialize() first.');
    }
    return this.realtimeAdapter;
  }
}

export const adapterFactory = AdapterFactory.getInstance();
