import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Validate environment variables at runtime
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL) {
  throw new Error(
    'Missing environment variable: VITE_SUPABASE_URL. ' +
    'Please check your .env file and ensure it contains the Supabase project URL.'
  );
}

if (!SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    'Missing environment variable: VITE_SUPABASE_PUBLISHABLE_KEY. ' +
    'Please check your .env file and ensure it contains the Supabase anon/public key.'
  );
}

// Initialize Supabase client with proper typing and configuration
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);