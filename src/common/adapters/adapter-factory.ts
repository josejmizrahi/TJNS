import { DatabaseAdapter } from './database.adapter';
import { SupabaseAdapter } from './supabase.adapter';
import { IPFSAdapter } from './ipfs.adapter';
import { EncryptionAdapter } from './encryption.adapter';
import { JewishIdentityAdapter } from './jewish-id';

class AdapterFactory {
  private static instance: AdapterFactory;
  private databaseAdapter?: DatabaseAdapter;
  private ipfsAdapter?: IPFSAdapter;
  private encryptionAdapter?: EncryptionAdapter;
  private jewishIdAdapter?: JewishIdentityAdapter;

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

  getJewishIdAdapter(): JewishIdentityAdapter {
    if (!this.jewishIdAdapter) {
      this.jewishIdAdapter = new JewishIdentityAdapter();
    }
    return this.jewishIdAdapter;
  }
}

export const adapterFactory = AdapterFactory.getInstance();
