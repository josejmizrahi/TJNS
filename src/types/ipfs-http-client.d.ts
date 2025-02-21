declare module 'ipfs-http-client' {
  export interface IPFSHTTPClient {
    add(data: Buffer | string): Promise<{ path: string }>;
    cat(path: string): AsyncIterable<Uint8Array>;
  }
  
  export function create(options?: { url: string }): IPFSHTTPClient;
}
