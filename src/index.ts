import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './common/config/app';
// Import database initialization
import { initializeDatabase } from './common/config/typeorm';
// Initialize database on startup
void initializeDatabase();
import { errorHandler, notFound } from './common/middleware/error';
// Database configuration is handled by adapter factory
import { connectXRPL } from './common/config/blockchain';
import { adapterFactory } from './common/adapters';

// Import routes
import identityRoutes from './identity/routes/identity.routes';
import tokenRoutes from './token/routes/token.routes';
import marketplaceRoutes from './marketplace/routes/listing.routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(`${config.apiPrefix}/identity`, identityRoutes);
app.use(`${config.apiPrefix}/tokens`, tokenRoutes);
app.use(`${config.apiPrefix}/marketplace`, marketplaceRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Initialize services
const initializeServices = async () => {
  try {
    // Initialize Supabase adapters
    adapterFactory.initialize(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
    // Initialize realtime features
    const realtime = adapterFactory.getRealtimeAdapter();
    
    // Subscribe to system-wide events
    await realtime.subscribeToChanges(
      'user_profiles',
      'UPDATE',
      (_payload) => {
        // Handle user profile updates (e.g., verification level changes)
        // Event handled by subscribers
      }
    );

    await realtime.subscribeToChanges(
      'transactions',
      'INSERT',
      (_payload) => {
        // Handle new transactions (e.g., for system monitoring)
        // Event handled by subscribers
      }
    );

    // Setup presence tracking
    await realtime.subscribeToPresence(
      'online_users',
      (state) => {
        // Handle online users state changes
        Object.keys(state).length; // Track online users count
        // State change handled by subscribers
      }
    );

    // Initialize XRPL connection
    await connectXRPL();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Initialization error: ${errorMessage}`);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await initializeServices();
  
  app.listen(config.port, () => {
    // Server started successfully
  });
};

startServer().catch((error) => {
  process.stderr.write(`Failed to start server: ${error}\n`);
  process.exit(1);
});

// Handle realtime connection issues
const handleRealtimeError = async (error: Error) => {
  process.stderr.write(`Realtime connection error: ${error}\n`);
  try {
    // Attempt to reinitialize realtime features
    const realtime = adapterFactory.getRealtimeAdapter();
    await realtime.subscribeToOnlineUsers((state) => {
      const _onlineCount = Object.keys(state).length;
      process.stdout.write(`Reconnected. Online users: ${_onlineCount}\n`);
    });
  } catch (retryError) {
    process.stderr.write(`Failed to reconnect realtime: ${retryError}\n`);
    process.exit(1);
  }
};

process.on('unhandledRejection', (error) => {
  process.stderr.write(`Unhandled rejection: ${error}\n`);
  if (error instanceof Error && error.message.includes('realtime')) {
    handleRealtimeError(error).catch(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', (error) => {
  process.stderr.write(`Uncaught exception: ${error}\n`);
  if (error.message.includes('realtime')) {
    handleRealtimeError(error).catch(() => process.exit(1));
  } else {
    process.exit(1);
  }
});
