import { User, KYCDocument } from '../types/models';

export interface DatabaseAdapter {
  // User management
  createUser(data: Partial<User>): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  
  // Document management
  uploadDocument(data: Partial<KYCDocument>): Promise<KYCDocument>;
  getDocumentById(id: string): Promise<KYCDocument | null>;
  getDocumentsByUserId(userId: string): Promise<KYCDocument[]>;
  updateDocument(id: string, data: Partial<KYCDocument>): Promise<KYCDocument>;
  
  // JewishID management
  createJewishIdentity(data: any): Promise<any>;
  getJewishIdentityById(id: string): Promise<any | null>;
  getJewishIdentityByUserId(userId: string): Promise<any | null>;
  updateJewishIdentity(id: string, data: any): Promise<any>;
}
