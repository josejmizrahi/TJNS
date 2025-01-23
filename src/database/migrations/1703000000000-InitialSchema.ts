import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1703000000000 implements MigrationInterface {
  name = 'InitialSchema1703000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Users table
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM ('user', 'admin', 'moderator', 'oracle', 'rabbi');
      CREATE TYPE "verification_level_enum" AS ENUM ('none', 'basic', 'verified', 'complete');
      CREATE TYPE "user_status_enum" AS ENUM ('active', 'suspended', 'banned', 'pending');
      
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar UNIQUE NOT NULL,
        "password_hash" varchar NOT NULL,
        "role" user_role_enum NOT NULL DEFAULT 'user',
        "verification_level" verification_level_enum NOT NULL DEFAULT 'none',
        "status" user_status_enum NOT NULL DEFAULT 'pending',
        "profile" jsonb NOT NULL,
        "wallet_address" varchar,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      );
    `);

    // KYC Documents table
    await queryRunner.query(`
      CREATE TYPE "document_status_enum" AS ENUM ('pending', 'verified', 'rejected');
      
      CREATE TABLE "kyc_documents" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"(id),
        "type" varchar NOT NULL,
        "ipfs_cid" varchar NOT NULL,
        "encryption_tag" varchar NOT NULL,
        "status" document_status_enum NOT NULL DEFAULT 'pending',
        "verified_at" timestamp,
        "verified_by" uuid REFERENCES "users"(id),
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      );
    `);

    // Token Balances table
    await queryRunner.query(`
      CREATE TYPE "token_type_enum" AS ENUM ('SHK', 'MVP');
      CREATE TYPE "trust_line_status_enum" AS ENUM ('none', 'pending', 'active', 'frozen');
      
      CREATE TABLE "token_balances" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"(id),
        "currency" token_type_enum NOT NULL,
        "balance" varchar NOT NULL DEFAULT '0',
        "trust_line_status" trust_line_status_enum NOT NULL DEFAULT 'none',
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        UNIQUE("user_id", "currency")
      );
    `);

    // Transactions table
    await queryRunner.query(`
      CREATE TYPE "transaction_type_enum" AS ENUM ('transfer', 'escrow', 'reward', 'fee');
      CREATE TYPE "transaction_status_enum" AS ENUM ('pending', 'completed', 'failed', 'cancelled');
      
      CREATE TABLE "transactions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "from_user_id" uuid NOT NULL REFERENCES "users"(id),
        "to_user_id" uuid NOT NULL REFERENCES "users"(id),
        "amount" varchar NOT NULL,
        "currency" token_type_enum NOT NULL,
        "type" transaction_type_enum NOT NULL,
        "status" transaction_status_enum NOT NULL DEFAULT 'pending',
        "xrpl_tx_hash" varchar,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      );
    `);

    // MitzvahPoints Rules table
    await queryRunner.query(`
      CREATE TABLE "mitzvah_points_rules" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "action_type" varchar NOT NULL,
        "base_points" integer NOT NULL,
        "multiplier" float NOT NULL DEFAULT 1.0,
        "max_points" integer,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "mitzvah_points_rules"`);
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TABLE "token_balances"`);
    await queryRunner.query(`DROP TABLE "kyc_documents"`);
    await queryRunner.query(`DROP TABLE "users"`);
    
    await queryRunner.query(`DROP TYPE "transaction_status_enum"`);
    await queryRunner.query(`DROP TYPE "transaction_type_enum"`);
    await queryRunner.query(`DROP TYPE "trust_line_status_enum"`);
    await queryRunner.query(`DROP TYPE "token_type_enum"`);
    await queryRunner.query(`DROP TYPE "document_status_enum"`);
    await queryRunner.query(`DROP TYPE "user_status_enum"`);
    await queryRunner.query(`DROP TYPE "verification_level_enum"`);
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}
