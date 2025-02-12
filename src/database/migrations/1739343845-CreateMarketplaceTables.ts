import { MigrationFn } from '../types';
import { Pool } from 'pg';

export const up: MigrationFn = async (client: Pool) => {
  // Create enum types
  await client.query(`
    CREATE TYPE listing_status AS ENUM ('draft', 'active', 'sold', 'suspended');
    CREATE TYPE listing_category AS ENUM ('food', 'judaica', 'books', 'services', 'education', 'other');
    CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'rejected', 'expired', 'withdrawn');
    CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
  `);

  // Create listings table
  await client.query(`
    CREATE TABLE marketplace_listings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      seller_id UUID NOT NULL REFERENCES users(id),
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      category listing_category NOT NULL,
      status listing_status NOT NULL DEFAULT 'draft',
      kosher_certification JSONB,
      images TEXT[],
      image_storage_type VARCHAR(50),
      shipping JSONB,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create offers table
  await client.query(`
    CREATE TABLE marketplace_offers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      listing_id UUID NOT NULL REFERENCES marketplace_listings(id),
      buyer_id UUID NOT NULL REFERENCES users(id),
      amount DECIMAL(10,2) NOT NULL,
      status offer_status NOT NULL DEFAULT 'pending',
      message TEXT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create transactions table
  await client.query(`
    CREATE TABLE marketplace_transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      listing_id UUID NOT NULL REFERENCES marketplace_listings(id),
      offer_id UUID REFERENCES marketplace_offers(id),
      buyer_id UUID NOT NULL REFERENCES users(id),
      seller_id UUID NOT NULL REFERENCES users(id),
      amount DECIMAL(10,2) NOT NULL,
      status transaction_status NOT NULL DEFAULT 'pending',
      tx_hash TEXT,
      shipping_details JSONB,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export const down: MigrationFn = async (client: Pool) => {
  await client.query(`
    DROP TABLE IF EXISTS marketplace_transactions;
    DROP TABLE IF EXISTS marketplace_offers;
    DROP TABLE IF EXISTS marketplace_listings;
    DROP TYPE IF EXISTS transaction_status;
    DROP TYPE IF EXISTS offer_status;
    DROP TYPE IF EXISTS listing_category;
    DROP TYPE IF EXISTS listing_status;
  `);
};
