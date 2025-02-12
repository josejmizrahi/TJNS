import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from './app';

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
  } catch (error) {
    throw error;
  }
};
