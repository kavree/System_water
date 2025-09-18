import { Database } from './services/database.types';

export type MeterReading = Database['public']['Tables']['meter_readings']['Row'];

export type House = Database['public']['Tables']['houses']['Row'] & {
  readings: MeterReading[];
};

export type WaterUnitRate = Database['public']['Tables']['water_unit_rates']['Row'];

export type ViewState = 
  | { page: 'dashboard' }
  | { page: 'details'; houseId: string };
