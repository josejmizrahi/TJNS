import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, KYCDocument, TokenBalance, Transaction } from '../types/models';

export interface DatabaseAdapter {
  // User operations
  createUser(user: Partial<User>): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  
  // KYC operations
  uploadDocument(document: Partial<KYCDocument>): Promise<KYCDocument>;
  getDocumentById(id: string): Promise<KYCDocument | null>;
  updateDocument(id: string, data: Partial<KYCDocument>): Promise<KYCDocument>;
  
  // Token operations
  getTokenBalance(userId: string, currency: string): Promise<TokenBalance | null>;
  updateTokenBalance(userId: string, currency: string, amount: string): Promise<TokenBalance>;
  createTransaction(transaction: Partial<Transaction>): Promise<Transaction>;
}

export class SupabaseAdapter implements DatabaseAdapter {
  private client: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.client = createClient(supabaseUrl, supabaseKey);
  }

  // User operations
  async createUser(user: Partial<User>): Promise<User> {
    const { data, error } = await this.client
      .from('user_profiles')
      .insert(user)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await this.client
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const { data: updated, error } = await this.client
      .from('user_profiles')
      .update(data)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return updated;
  }

  // KYC operations
  async uploadDocument(document: Partial<KYCDocument>): Promise<KYCDocument> {
    const { data, error } = await this.client
      .from('kyc_documents')
      .insert(document)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  async getDocumentById(id: string): Promise<KYCDocument | null> {
    const { data, error } = await this.client
      .from('kyc_documents')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  }

  async updateDocument(id: string, data: Partial<KYCDocument>): Promise<KYCDocument> {
    const { data: updated, error } = await this.client
      .from('kyc_documents')
      .update(data)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return updated;
  }

  // Token operations
  async getTokenBalance(userId: string, currency: string): Promise<TokenBalance | null> {
    const { data, error } = await this.client
      .from('token_balances')
      .select('*')
      .eq('user_id', userId)
      .eq('currency', currency)
      .single();
      
    if (error) throw error;
    return data;
  }

  async updateTokenBalance(userId: string, currency: string, amount: string): Promise<TokenBalance> {
    const { data, error } = await this.client
      .from('token_balances')
      .upsert({
        user_id: userId,
        currency,
        balance: amount
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  async createTransaction(transaction: Partial<Transaction>): Promise<Transaction> {
    const { data, error } = await this.client
      .from('transactions')
      .insert(transaction)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
}
