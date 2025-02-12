import { MigrationFn } from '../init';

export const up: MigrationFn = async (client) => {
  await client.query(`
    ALTER TABLE user_profiles
    ADD COLUMN mfa_enabled BOOLEAN DEFAULT FALSE,
    ADD COLUMN mfa_secret TEXT,
    ADD COLUMN mfa_backup_codes TEXT[],
    ADD COLUMN mfa_verified BOOLEAN DEFAULT FALSE;
  `);
};

export const down: MigrationFn = async (client) => {
  await client.query(`
    ALTER TABLE user_profiles
    DROP COLUMN mfa_enabled,
    DROP COLUMN mfa_secret,
    DROP COLUMN mfa_backup_codes,
    DROP COLUMN mfa_verified;
  `);
};
