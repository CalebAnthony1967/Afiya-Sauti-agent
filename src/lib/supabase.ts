import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://tellmftgigykdavkzqju.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_k8Xw5ayGDeYc7quV3zOL-w_jXDkcAtx';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing Supabase URL or Anon Key. Please check environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'afiyaSauti',
    },
  },
});

export default supabase;
