import { MigrationFn } from '../types';

export const up: MigrationFn = async (client) => {
  await client.query(`
    -- Add new columns to users table for profile sync
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS mfa_verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS jewish_identity_id UUID REFERENCES jewish_identities(id),
    ADD COLUMN IF NOT EXISTS verification_level VARCHAR(50) DEFAULT 'none',
    ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE;

    -- Create sync history table
    CREATE TABLE IF NOT EXISTS profile_sync_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      jewish_identity_id UUID REFERENCES jewish_identities(id),
      sync_type VARCHAR(50) NOT NULL,
      sync_status VARCHAR(50) NOT NULL,
      sync_details JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create trigger to update last_sync_at
    CREATE OR REPLACE FUNCTION update_last_sync_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.last_sync_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER update_user_sync_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    WHEN (OLD.* IS DISTINCT FROM NEW.*)
    EXECUTE FUNCTION update_last_sync_timestamp();
  `);
};

export const down: MigrationFn = async (client) => {
  await client.query(`
    -- Remove trigger and function
    DROP TRIGGER IF EXISTS update_user_sync_timestamp ON users;
    DROP FUNCTION IF EXISTS update_last_sync_timestamp();

    -- Drop sync history table
    DROP TABLE IF EXISTS profile_sync_history;

    -- Remove columns from users table
    ALTER TABLE users
    DROP COLUMN IF EXISTS mfa_enabled,
    DROP COLUMN IF EXISTS mfa_verified,
    DROP COLUMN IF EXISTS jewish_identity_id,
    DROP COLUMN IF EXISTS verification_level,
    DROP COLUMN IF EXISTS last_sync_at;
  `);
};
