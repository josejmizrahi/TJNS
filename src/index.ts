import express from 'express';
import dotenv from 'dotenv';
import { initXrplClient } from './config/xrpl';
import { connectDatabase } from './config/database';
import routes from './routes';
import { errorHandler } from './middleware/error';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use('/api', routes);

// Error handling
app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    // Initialize XRPL client and database connection
    await Promise.all([
      initXrplClient(),
      connectDatabase()
    ]);
    
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
