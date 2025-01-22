import express from 'express';
import dotenv from 'dotenv';
import { initXrplClient } from './config/xrpl';
import routes from './routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', routes);

const startServer = async (): Promise<void> => {
  try {
    // Initialize XRPL client
    await initXrplClient();
    
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
