import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, KYCDocument, TokenBalance, Transaction, MitzvahPointsRuleEntity } from '../types/models';

export interface DatabaseAdapter {
  // User operations
  createUser(user: Partial<User>): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  
  // KYC operations
  uploadDocument(document: Partial<KYCDocument>): Promise<KYCDocument>;
  getDocumentById(id: string): Promise<KYCDocument | null>;
  getDocumentsByUserId(userId: string): Promise<KYCDocument[]>;
  updateDocument(id: string, data: Partial<KYCDocument>): Promise<KYCDocument>;
  
  // Token operations
  getTokenBalance(userId: string, currency: string): Promise<string>;
  updateTokenBalance(userId: string, currency: string, balance: string, data?: Partial<TokenBalance>): Promise<TokenBalance>;
  createTransaction(transaction: Partial<Transaction>): Promise<Transaction>;
  updateTransaction(id: string, data: Partial<Transaction>): Promise<Transaction>;
  getMitzvahPointsRule(action: string): Promise<MitzvahPointsRuleEntity | null>;
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

  async getDocumentsByUserId(userId: string): Promise<KYCDocument[]> {
    const { data, error } = await this.client
      .from('kyc_documents')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    return data || [];
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
  async getTokenBalance(userId: string, currency: string): Promise<string> {
    const { data, error } = await this.client
      .from('token_balances')
      .select('balance')
      .eq('user_id', userId)
      .eq('currency', currency)
      .single();
      
    if (error) return '0';
    return data?.balance || '0';
  }

  async updateTokenBalance(
    userId: string, 
    currency: string, 
    balance: string,
    data?: Partial<TokenBalance>
  ): Promise<TokenBalance> {
    const { data: updated, error } = await this.client
      .from('token_balances')
      .upsert({
        user_id: userId,
        currency,
        balance,
        ...data
      })
      .select()
      .single();
      
    if (error) throw error;
    return updated;
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

  async updateTransaction(id: string, data: Partial<Transaction>): Promise<Transaction> {
    const { data: updated, error } = await this.client
      .from('transactions')
      .update(data)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return updated;
  }

  async getMitzvahPointsRule(action: string): Promise<MitzvahPointsRuleEntity | null> {
    const { data, error } = await this.client
      .from('mitzvah_points_rules')
      .select('*')
      .eq('action_type', action)
      .eq('is_active', true)
      .single();
      
    if (error) return null;
    return data;
  }
}
