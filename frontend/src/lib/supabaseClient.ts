/**
 * Supabase Client Initialization.
 *
 * WHAT IT IS:
 *   Initializes the official Supabase JavaScript client with public environment variables.
 *
 * WHY WE USE IT:
 *   Handles client-side authentication (signup, login with password, social login, session refresh).
 *
 * SECURITY:
 *   Only public variables (URL and anon key) are used here. The service role key is NEVER used on the frontend.
 */

import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-cognitio.supabase.co';
// Strip accidental trailing /rest/v1 or trailing slashes
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
