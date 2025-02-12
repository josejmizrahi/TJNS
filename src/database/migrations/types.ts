import { Pool } from 'pg';

export type MigrationFn = (client: Pool) => Promise<void>;
