import { User, KYCDocument } from '../types/models';
import { JewishIdentityEntity } from '../../identity/models/jewish-id.model';
import { TokenEntity, TokenType } from '../../blockchain/models/token.model';
// Database types

export interface DatabaseAdapter {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  // User management
  createUser(data: Partial<User>): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  
  // Document management
  uploadDocument(data: Partial<KYCDocument>): Promise<KYCDocument>;
  getDocumentById(id: string): Promise<KYCDocument | null>;
  getDocumentsByUserId(userId: string): Promise<KYCDocument[]>;
  updateDocument(id: string, data: Partial<KYCDocument>): Promise<KYCDocument>;
  
  // Raw query execution
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  
  // Token management
  createToken(data: Partial<TokenEntity>): Promise<TokenEntity>;
  getTokenByUserAndType(userId: string, type: TokenType): Promise<TokenEntity | null>;
  updateToken(id: string, data: Partial<TokenEntity>): Promise<TokenEntity>;
  
  // JewishID management
  createJewishIdentity(data: Partial<JewishIdentityEntity>): Promise<JewishIdentityEntity>;
  getJewishIdentityById(id: string): Promise<JewishIdentityEntity | null>;
  getJewishIdentityByUserId(userId: string): Promise<JewishIdentityEntity | null>;
  updateJewishIdentity(id: string, data: Partial<JewishIdentityEntity>): Promise<JewishIdentityEntity>;
}
