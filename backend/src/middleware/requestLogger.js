import morgan from 'morgan';
import logger from '../utils/logger.js';

// Use morgan to log concise request details and pass to winston
const stream = {
  write: (message) => logger.http ? logger.http(message.trim()) : logger.info(message.trim())
};

export const requestLogger = morgan('combined', { stream });
