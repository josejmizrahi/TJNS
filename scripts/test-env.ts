import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config();

// Verify Supabase credentials are loaded
const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing required Supabase environment variables');
  process.exit(1);
}

// Try to initialize Supabase client
try {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('✓ Supabase environment variables loaded successfully');
  console.log('✓ Supabase client initialized');
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  process.exit(1);
}
