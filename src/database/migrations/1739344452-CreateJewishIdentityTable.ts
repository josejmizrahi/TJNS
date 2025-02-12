import { MigrationFn } from '../types';
import { Pool } from 'pg';

export const up: MigrationFn = async (client: Pool) => {
  // Create enum types
  await client.query(`
    CREATE TYPE hebrew_name_type AS ENUM ('birth', 'chosen', 'both');
    CREATE TYPE jewish_affiliation AS ENUM ('orthodox', 'conservative', 'reform', 'reconstructionist', 'secular', 'other');
  `);

  // Create jewish_identities table
  await client.query(`
    CREATE TABLE jewish_identities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
      hebrew_name TEXT,
      hebrew_name_type hebrew_name_type,
      affiliation jewish_affiliation,
      synagogue TEXT,
      rabbi TEXT,
      community TEXT,
      family_history JSONB,
      verified_by TEXT[] DEFAULT '{}',
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export const down: MigrationFn = async (client: Pool) => {
  await client.query(`
    DROP TABLE IF EXISTS jewish_identities;
    DROP TYPE IF EXISTS hebrew_name_type;
    DROP TYPE IF EXISTS jewish_affiliation;
  `);
};
