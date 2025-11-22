import express from 'express';
import mongoose from 'mongoose';
import { register } from 'prom-client';
import { config } from '../config/index.js';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    env: config.env,
    dbConnected: mongoose.connection.readyState === 1
  });
});

router.get('/metrics', async (req, res) => {
  if (!config.enableMetrics) return res.status(404).send('Metrics disabled');
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

export default router;
