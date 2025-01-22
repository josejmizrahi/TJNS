import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  xrplNetwork: process.env.XRPL_NETWORK || 'testnet',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/tjns',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  encryptionKey: process.env.ENCRYPTION_KEY,
};
