import { DataSource } from 'typeorm';
import { JewishIdentityEntity } from '../../identity/models';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'tjns',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [JewishIdentityEntity],
  migrations: ['src/database/migrations/*.ts'],
  subscribers: []
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    // Database connection initialized successfully
  } catch (error) {
    // Log error and rethrow
    throw new Error(`Error initializing database: ${error}`);
  }
};

export { AppDataSource };
