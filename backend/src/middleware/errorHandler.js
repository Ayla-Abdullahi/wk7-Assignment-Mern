import logger from '../utils/logger.js';

export function notFound (req, res, next) {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

export function errorHandler (err, req, res, next) { // eslint-disable-line
  logger.error({ message: err.message, stack: err.stack });
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message,
    status
  });
}
