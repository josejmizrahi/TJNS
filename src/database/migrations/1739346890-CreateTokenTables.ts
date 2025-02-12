import { MigrationFn } from '../types';

export const up: MigrationFn = async (client) => {
  await client.query(`
    CREATE TYPE token_type AS ENUM ('shekel', 'mitzvah');

    CREATE TABLE tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      type token_type NOT NULL DEFAULT 'shekel',
      balance DECIMAL(18,6) NOT NULL DEFAULT 0,
      xrpl_address VARCHAR(255) NOT NULL,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_tokens_user_type ON tokens(user_id, type);
    CREATE INDEX idx_tokens_xrpl_address ON tokens(xrpl_address);

    -- Create trigger to update updated_at timestamp
    CREATE OR REPLACE FUNCTION update_token_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER update_token_timestamp
    BEFORE UPDATE ON tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_token_timestamp();
  `);
};

export const down: MigrationFn = async (client) => {
  await client.query(`
    DROP TRIGGER IF EXISTS update_token_timestamp ON tokens;
    DROP FUNCTION IF EXISTS update_token_timestamp();
    DROP TABLE IF EXISTS tokens;
    DROP TYPE IF EXISTS token_type;
  `);
};
