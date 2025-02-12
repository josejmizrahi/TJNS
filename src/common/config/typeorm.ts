import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from './app';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: config.env === 'development',
  entities: ['src/**/*.model.{js,ts}'],
  migrations: ['src/database/migrations/*.{js,ts}'],
  subscribers: [],
  extra: {
    ssl: config.env === 'production'
  }
});

export const initializeDatabase = async (): Promise<void> => {
  await AppDataSource.initialize();
};
