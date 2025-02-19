import { MigrationInterface, QueryRunner } from 'typeorm';

export class JewishIdEnhancements1708365691000 implements MigrationInterface {
  name = 'JewishIdEnhancements1708365691000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "tribal_affiliation_enum" AS ENUM ('kohen', 'levi', 'israel');

      ALTER TABLE "jewish_identities"
      ADD COLUMN "tribal_affiliation" tribal_affiliation_enum,
      ADD COLUMN "maternal_ancestry" jsonb,
      ADD COLUMN "paternal_ancestry" jsonb,
      ADD COLUMN "verification_level" verification_level_enum DEFAULT 'none',
      ADD COLUMN "verification_documents" jsonb DEFAULT '[]';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "jewish_identities"
      DROP COLUMN "tribal_affiliation",
      DROP COLUMN "maternal_ancestry",
      DROP COLUMN "paternal_ancestry",
      DROP COLUMN "verification_level",
      DROP COLUMN "verification_documents";

      DROP TYPE "tribal_affiliation_enum";
    `);
  }
}
