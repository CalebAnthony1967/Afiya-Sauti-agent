/**
 * Supabase Client (COMMENTED — for migration readiness)
 * =====================================================
 * This file is ready for Supabase migration. To activate Supabase:
 * 1. Uncomment the code below
 * 2. npm install @supabase/supabase-js
 * 3. Set environment variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
 * 4. Replace base44 entity calls with supabase.from('table') calls
 *
 * The app currently uses Base44 SDK (see @/api/base44Client).
 * Every data access point in the app has a commented Supabase alternative.
 */

/*
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
    headers: { 'x-application-name': 'afiyaSauti' },
  },
});

// Example: query triage sessions
// const { data, error } = await supabase
//   .from('triage_sessions')
//   .select('*')
//   .eq('profile_id', userId)
//   .order('created_at', { ascending: false });
*/

// Base44 active export (used throughout the app)
export const supabaseClient = null; // placeholder — uncomment above to activate
export default supabaseClient;