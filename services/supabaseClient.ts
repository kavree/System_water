import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// !! สำคัญ !!
// กรุณาแทนที่ค่าด้านล่างนี้ด้วย Supabase Project URL และ Anon Key ของคุณ
// แนะนำให้ใช้ Environment Variables สำหรับการเก็บค่าเหล่านี้เพื่อความปลอดภัย
const supabaseUrl = 'https://aesqrbmwblgdqpxrapaq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlc3FyYm13YmxnZHFweHJhcGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNTEyMjQsImV4cCI6MjA2NzgyNzIyNH0.LjofXuOT5CL2IvGThSv_dI9mBSpozIyapd8PAmVZ-UI';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);