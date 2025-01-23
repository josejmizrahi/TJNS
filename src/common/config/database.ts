import { DataSource } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
import mongoose from 'mongoose';

dotenvConfig();

// PostgreSQL Connection
export const postgresConnection = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER || 'jns_user',
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB || 'jns_db',
  entities: ['src/**/entities/*.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
});

// MongoDB Connection
export const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jns');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default {
  postgresConnection,
  connectMongoDB,
};
