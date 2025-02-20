import { createClient } from '@supabase/supabase-js';
import { config } from './app';

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
        'x-application-name': config.appName
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
            'x-application-name': `${config.appName}-admin`
          }
        }
      }
    )
  : null;

// Test database connection
export const testConnection = async () => {
  try {
    const { error } = await supabase.from('users').select('count').single();
    if (error) throw error;
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Database connection error: ${errorMessage}`);
    return false;
  }
};

export default {
  supabase,
  supabaseAdmin,
  testConnection
};
