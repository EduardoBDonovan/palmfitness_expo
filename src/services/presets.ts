import { supabase } from '../lib/supabase';
import { UserPreset, PresetType } from '../types';

export const PresetsService = {
  async fetchPresets(userId: string): Promise<UserPreset[]> {
    const { data, error } = await supabase
      .from('user_presets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createPreset(preset: Partial<UserPreset>): Promise<UserPreset> {
    const { data, error } = await supabase
      .from('user_presets')
      .upsert(preset)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePreset(id: string): Promise<void> {
    const { error } = await supabase
      .from('user_presets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updatePreset(id: string, updates: Partial<UserPreset>): Promise<UserPreset> {
    const { data, error } = await supabase
      .from('user_presets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
