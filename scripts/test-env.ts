import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config();

// Verify Supabase credentials are loaded
const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing required Supabase environment variables');
}

// Try to initialize Supabase client
try {
  createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  // Environment variables and client initialization successful
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  throw new Error(`Failed to initialize Supabase client: ${errorMessage}`);
}
