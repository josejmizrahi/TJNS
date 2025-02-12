// Storage service interface for marketplace

export interface IStorageService {
  store(path: string, data: Record<string, unknown>): Promise<void>;
  retrieve(path: string): Promise<Record<string, unknown> | null>;
}
