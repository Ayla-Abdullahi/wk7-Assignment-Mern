import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import * as Sentry from '@sentry/node';
import mongoose from 'mongoose';
import { config } from './config/index.js';
import routes from './routes/index.js';
import { requestLogger } from './middleware/requestLogger.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import logger from './utils/logger.js';
import { collectDefaultMetrics, Histogram, Gauge } from 'prom-client';

if (config.sentryDsn) {
  Sentry.init({ dsn: config.sentryDsn, environment: config.env });
}

let httpDurationHistogram;
let memoryGauge;
let eventLoopLagGauge;

if (config.enableMetrics) {
  collectDefaultMetrics();
  httpDurationHistogram = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code']
  });
  memoryGauge = new Gauge({ name: 'process_memory_bytes', help: 'Resident set memory in bytes' });
  eventLoopLagGauge = new Gauge({ name: 'event_loop_lag_ms', help: 'Event loop lag in ms' });
  setInterval(() => {
    memoryGauge.set(process.memoryUsage().rss);
  }, 10000).unref();
  let last = process.hrtime.bigint();
  setInterval(() => {
    const now = process.hrtime.bigint();
    const diffMs = Number(now - last) / 1e6 - 100; // expected ~100ms
    eventLoopLagGauge.set(diffMs < 0 ? 0 : diffMs);
    last = now;
  }, 100).unref();
}

// Metrics timing middleware
if (config.enableMetrics) {
  const timing = (req, res, next) => {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const diff = Number(process.hrtime.bigint() - start) / 1e9;
      if (httpDurationHistogram) {
        httpDurationHistogram.labels(req.method, req.route?.path || req.path, res.statusCode).observe(diff);
      }
    });
    next();
  };
  // Insert early to measure full stack
  timing._name = 'metricsTiming';
}

const app = express();

// Security & performance middlewares
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || config.allowedOrigins.includes('*') || config.allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('CORS not allowed'), false);
  },
  credentials: true
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
if (config.enableMetrics) {
  app.use((req, res, next) => {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const diff = Number(process.hrtime.bigint() - start) / 1e9;
      if (httpDurationHistogram) {
        httpDurationHistogram.labels(req.method, req.route?.path || req.path, res.statusCode).observe(diff);
      }
    });
    next();
  });
}
app.use(express.json());
app.use(requestLogger);

// DB connection pooling (mongoose manages its own pool)
if (config.env !== 'test') {
  mongoose.connect(config.mongoUri, {
    maxPoolSize: 10
  }).then(() => logger.info('MongoDB connected')).catch(err => logger.error(err));
}

// Sentry request handler (before routes) if configured
if (config.sentryDsn) {
  app.use(Sentry.Handlers.requestHandler());
}

// Routes
app.use('/api', routes);

// 404 & error handling (Sentry error handler first if enabled)
app.use(notFound);
if (config.sentryDsn) {
  app.use(Sentry.Handlers.errorHandler());
}
app.use(errorHandler);

export default app;
