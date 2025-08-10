import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

 // ตั้งค่า Supabase ผ่าน Environment Variables (Vite)
 // ใช้ anon public key เท่านั้น ห้ามใช้ service_role ในโค้ดฝั่งเว็บ
 const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://gfqwdzpygiejxucbjtid.supabase.co';
 const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmcXdkenB5Z2llanh1Y2JqdGlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MTI3NjEsImV4cCI6MjA3MDM4ODc2MX0.eH2_OEIn7n3eB4xzzcvSaGbdH3bAv2ND5Ftf5jkz_9k';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);