import { StorageMetadata } from '../common/types/storage';

export interface IStorageService {
  store(path: string, data: Record<string, unknown>): Promise<void>;
  retrieve(path: string): Promise<Record<string, unknown> | null>;
}
