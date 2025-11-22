import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/week7',
  sentryDsn: process.env.SENTRY_DSN || '',
  enableMetrics: process.env.ENABLE_METRICS === 'true',
  logLevel: process.env.LOG_LEVEL || 'info',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || '*').split(',').map(o => o.trim()).filter(Boolean)
};
