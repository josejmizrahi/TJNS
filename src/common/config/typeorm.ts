import { DataSource } from 'typeorm';
import { JewishIdentityEntity } from '../../identity/models/jewish-id.model';

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
    console.log('Database connection initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export { AppDataSource };
