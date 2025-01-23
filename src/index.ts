import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './common/config/app';
import { errorHandler, notFound } from './common/middleware/error';
import { postgresConnection, connectMongoDB } from './common/config/database';
import { connectXRPL } from './common/config/blockchain';

// Import routes
import identityRoutes from './identity/routes/identity.routes';
import tokenRoutes from './token/routes/token.routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(`${config.apiPrefix}/identity`, identityRoutes);
app.use(`${config.apiPrefix}/tokens`, tokenRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Database initialization
const initializeDatabase = async () => {
  try {
    await postgresConnection.initialize();
    console.log('PostgreSQL connected successfully');
    
    await connectMongoDB();
    console.log('MongoDB connected successfully');
    
    await connectXRPL();
    console.log('XRPL connected successfully');
  } catch (error) {
    console.error('Error during initialization:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await initializeDatabase();
  
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});
