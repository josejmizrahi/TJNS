import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface XRPLConfig {
  nodeUrl: string;
  issuerAddress?: string;
  tokenCode: string;
}

export const config = {
  appName: 'jewish-network-state',
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRATION || '24h',
  },
  
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },

  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  
  xrpl: {
    nodeUrl: process.env.XRPL_NODE_URL || 'wss://s.altnet.rippletest.net:51233',
    issuerAddress: process.env.XRPL_ISSUER_ADDRESS,
    tokenCode: process.env.XRPL_TOKEN_CODE || 'SHK'
  } as XRPLConfig,

  storage: {
    ipfs: {
      host: process.env.IPFS_HOST || 'ipfs.infura.io',
      port: parseInt(process.env.IPFS_PORT || '5001'),
      protocol: process.env.IPFS_PROTOCOL || 'https'
    }
  }
};

export default config;
