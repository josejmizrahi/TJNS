/**
 * Client-side encryption utilities for sensitive data
 */
export class ClientEncryption {
  private static async generateKey(): Promise<CryptoKey> {
    return window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  private static async exportKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey('raw', key);
    return btoa(Array.from(new Uint8Array(exported), byte => String.fromCharCode(byte)).join(''));
  }

  private static async importKey(keyData: string): Promise<CryptoKey> {
    const keyBuffer = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
    return window.crypto.subtle.importKey(
      'raw',
      keyBuffer,
      'AES-GCM',
      true,
      ['encrypt', 'decrypt']
    );
  }

  static async encryptData(data: string): Promise<{ encrypted: string; key: string }> {
    const key = await this.generateKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(data);

    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      encodedData
    );

    const exportedKey = await this.exportKey(key);
    const encryptedBase64 = btoa(
      Array.from(new Uint8Array(encrypted), byte => String.fromCharCode(byte)).join('')
    );
    const ivBase64 = btoa(Array.from(iv, byte => String.fromCharCode(byte)).join(''));

    return {
      encrypted: `${encryptedBase64}.${ivBase64}`,
      key: exportedKey
    };
  }

  static async decryptData(encrypted: string, keyData: string): Promise<string> {
    const [encryptedBase64, ivBase64] = encrypted.split('.');
    const key = await this.importKey(keyData);
    
    const encryptedData = Uint8Array.from(
      atob(encryptedBase64),
      c => c.charCodeAt(0)
    );
    const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      encryptedData
    );

    return new TextDecoder().decode(decrypted);
  }
}
