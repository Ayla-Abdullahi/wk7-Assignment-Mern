import { config } from './src/config/index.js';
import app from './src/app.js';
import logger from './src/utils/logger.js';

const server = app.listen(config.port, () => {
  logger.info(`Backend listening on port ${config.port} (${config.env})`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});
