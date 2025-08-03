const database = require('./config/database');
const logger = require('./utils/logger');

async function startServer() {
  try {
    // Initialize database connection
    logger.info('🔌 Connecting to database...');
    await database.connect();
    
    // Start the Express server
    logger.info('🚀 Starting Express server...');
    require('./app');
    
    logger.info('✅ Server started successfully');
    
    // Graceful shutdown handling
    process.on('SIGINT', async () => {
      logger.info('🛑 Received SIGINT, shutting down gracefully...');
      await database.close();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      logger.info('🛑 Received SIGTERM, shutting down gracefully...');
      await database.close();
      process.exit(0);
    });
    
  } catch (error) {
    logger.error('❌ Failed to start server:', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

// Start the server
startServer();
