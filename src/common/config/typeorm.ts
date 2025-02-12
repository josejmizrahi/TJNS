import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from './app';
import { TokenEntity } from '../../blockchain/models/token.model';
import { JewishIdentityEntity } from '../../identity/models/jewish-id.model';
import { ListingEntity } from '../../marketplace/models/listing.model';
import { OfferEntity } from '../../marketplace/models/offer.model';
import { TransactionEntity } from '../../marketplace/models/transaction.model';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: config.env === 'development',
  entities: ['src/**/*.model.ts'],
  migrations: ['src/database/migrations/*.ts'],
  subscribers: []
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('Database initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};
