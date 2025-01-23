import { createClient } from '@supabase/supabase-js';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

// Initialize Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'x-application-name': 'jns'
      }
    }
  }
);

// Initialize admin client if service key is available
export const supabaseAdmin = process.env.SUPABASE_SERVICE_KEY
  ? createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        },
        db: {
          schema: 'public'
        },
        global: {
          headers: {
            'x-application-name': 'jns-admin'
          }
        }
      }
    )
  : null;

// Test database connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').single();
    if (error) throw error;
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};

export default {
  supabase,
  supabaseAdmin,
  testConnection
};
