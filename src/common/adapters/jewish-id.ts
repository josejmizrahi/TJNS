import { supabase } from '../config/supabase';
import { JewishIdentityEntity } from '../../identity/models';
import { AppError } from '../middleware/error';

export class JewishIdentityAdapter {
  async createJewishIdentity(data: Partial<JewishIdentityEntity>): Promise<JewishIdentityEntity> {
    const { data: identity, error } = await supabase
      .from('jewish_identities')
      .insert(data)
      .single();

    if (error) throw new AppError(400, error.message);
    return identity;
  }

  async getJewishIdentityById(id: string): Promise<JewishIdentityEntity | null> {
    const { data, error } = await supabase
      .from('jewish_identities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new AppError(400, error.message);
    return data;
  }

  async getJewishIdentityByUserId(userId: string): Promise<JewishIdentityEntity | null> {
    const { data, error } = await supabase
      .from('jewish_identities')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') return null;
    return data;
  }

  async updateJewishIdentity(id: string, data: Partial<JewishIdentityEntity>): Promise<JewishIdentityEntity> {
    const { data: updated, error } = await supabase
      .from('jewish_identities')
      .update(data)
      .eq('id', id)
      .single();

    if (error) throw new AppError(400, error.message);
    return updated;
  }
}

export default new JewishIdentityAdapter();
