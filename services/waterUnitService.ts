import { supabase } from './supabaseClient';
import { WaterUnitRate } from '../types';

export const getCurrentWaterUnitRate = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('water_unit_rates')
      .select('rate_per_unit')
      .eq('is_active', true)
      .order('effective_from', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching current water unit rate:', error);
      // Return default rate if database fails
      return 5;
    }

    return data?.rate_per_unit || 5;
  } catch (err) {
    console.error('Error in getCurrentWaterUnitRate:', err);
    return 5;
  }
};

export const updateWaterUnitRate = async (newRate: number): Promise<void> => {
  try {
    // Start a transaction by first deactivating all current rates
    const { error: deactivateError } = await supabase
      .from('water_unit_rates')
      .update({ is_active: false })
      .eq('is_active', true);

    if (deactivateError) throw deactivateError;

    // Insert new active rate
    const { error: insertError } = await supabase
      .from('water_unit_rates')
      .insert({
        rate_per_unit: newRate,
        effective_from: new Date().toISOString(),
        is_active: true
      });

    if (insertError) throw insertError;
  } catch (err) {
    console.error('Error updating water unit rate:', err);
    throw err;
  }
};

export const getWaterUnitRateHistory = async (): Promise<WaterUnitRate[]> => {
  try {
    const { data, error } = await supabase
      .from('water_unit_rates')
      .select('*')
      .order('effective_from', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (err) {
    console.error('Error fetching water unit rate history:', err);
    return [];
  }
};