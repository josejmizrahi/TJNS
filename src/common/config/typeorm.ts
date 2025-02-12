import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from './app';
import { TokenEntity } from '../../blockchain/models/token.model';
import { JewishIdentityEntity } from '../../identity/models/jewish-id.model';
import { ListingEntity, OfferEntity, TransactionEntity } from '../../marketplace/models';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: config.env === 'development',
  entities: [
    TokenEntity,
    JewishIdentityEntity,
    ListingEntity,
    OfferEntity,
    TransactionEntity
  ],
  migrations: ['src/database/migrations/*.{js,ts}'],
  subscribers: [],
  extra: {
    ssl: config.env === 'production'
  }
});

export const initializeDatabase = async (): Promise<void> => {
  await AppDataSource.initialize();
};
