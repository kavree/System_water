import { Database } from './services/database.types';

export type MeterReading = Database['public']['Tables']['meter_readings']['Row'];

export type House = Database['public']['Tables']['houses']['Row'] & {
  readings: MeterReading[];
};

export type ViewState = 
  | { page: 'dashboard' }
  | { page: 'details'; houseId: string };
