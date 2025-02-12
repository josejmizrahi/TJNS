import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, KYCDocument, TokenBalance, Transaction, MitzvahPointsRuleEntity, Escrow } from '../types/models';

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
  createEscrow(escrow: Partial<Escrow>): Promise<Escrow>;
  updateEscrow(id: string, data: Partial<Escrow>): Promise<Escrow>;
  getMitzvahPointsRule(action: string): Promise<MitzvahPointsRuleEntity | null>;
}

import { supabase } from '../config/supabase';
import { AppError } from '../middleware/error';
import { JewishIdentityEntity } from '../../identity/models/jewish-id.model';

export class SupabaseAdapter implements DatabaseAdapter {
  constructor() {
    this.client = supabase;
  }

  private client: SupabaseClient;

  // JewishID methods
  async createJewishIdentity(data: Partial<JewishIdentityEntity>): Promise<JewishIdentityEntity> {
    const { data: identity, error } = await this.client
      .from('jewish_identities')
      .insert(data)
      .single();

    if (error) throw new AppError(400, error.message);
    return identity;
  }

  async getJewishIdentityById(id: string): Promise<JewishIdentityEntity | null> {
    const { data, error } = await this.client
      .from('jewish_identities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new AppError(400, error.message);
    return data;
  }

  async getJewishIdentityByUserId(userId: string): Promise<JewishIdentityEntity | null> {
    const { data, error } = await this.client
      .from('jewish_identities')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') return null;
    return data;
  }

  async updateJewishIdentity(id: string, data: Partial<JewishIdentityEntity>): Promise<JewishIdentityEntity> {
    const { data: updated, error } = await this.client
      .from('jewish_identities')
      .update(data)
      .eq('id', id)
      .single();

    if (error) throw new AppError(400, error.message);
    return updated;
  }
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

  async createEscrow(escrow: Partial<Escrow>): Promise<Escrow> {
    const { data, error } = await this.client
      .from('escrows')
      .insert(escrow)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  async updateEscrow(id: string, data: Partial<Escrow>): Promise<Escrow> {
    const { data: updated, error } = await this.client
      .from('escrows')
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
