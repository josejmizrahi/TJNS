import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMarketplaceListings1737665218 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types first
    await queryRunner.query(`
      CREATE TYPE listing_status AS ENUM (
        'draft',
        'active',
        'sold',
        'suspended'
      );
    `);

    await queryRunner.query(`
      CREATE TYPE listing_category AS ENUM (
        'food',
        'judaica',
        'books',
        'services',
        'education',
        'other'
      );
    `);

    await queryRunner.createTable(
      new Table({
        name: 'marketplace_listings',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid'
          },
          {
            name: 'seller_id',
            type: 'uuid',
            isNullable: false
          },
          {
            name: 'title',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false
          },
          {
            name: 'category',
            type: 'listing_category',
            isNullable: false
          },
          {
            name: 'status',
            type: 'listing_status',
            default: "'draft'",
            isNullable: false
          },
          {
            name: 'kosher_certification',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'images',
            type: 'text[]',
            isNullable: true
          },
          {
            name: 'image_storage_type',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'shipping',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: '{}',
            isNullable: false
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false
          }
        ],
        foreignKeys: [
          {
            columnNames: ['seller_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE'
          }
        ],
        indices: [
          {
            name: 'idx_marketplace_listings_seller',
            columnNames: ['seller_id']
          },
          {
            name: 'idx_marketplace_listings_category',
            columnNames: ['category']
          },
          {
            name: 'idx_marketplace_listings_status',
            columnNames: ['status']
          },
          {
            name: 'idx_marketplace_listings_created',
            columnNames: ['created_at']
          }
        ]
      }),
      true
    );

    // Add trigger for updated_at
    await queryRunner.query(`
      CREATE TRIGGER update_marketplace_listings_updated_at
      BEFORE UPDATE ON marketplace_listings
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('marketplace_listings');
    await queryRunner.query('DROP TYPE IF EXISTS listing_status;');
    await queryRunner.query('DROP TYPE IF EXISTS listing_category;');
  }
}
