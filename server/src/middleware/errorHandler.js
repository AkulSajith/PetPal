import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/apiError.js';

export function notFoundHandler(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(error, _req, res, _next) {
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return res.status(401).json({ error: { message: 'Session expired. Please log in again.' } });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: { message: 'Duplicate record', details: error.meta } });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Record not found' } });
    }
  }

  const statusCode = error.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    error: {
      message: statusCode >= 500 && isProduction ? 'Internal server error' : error.message || 'Internal server error',
      details: statusCode >= 500 && isProduction ? undefined : error.details,
    },
  });
}
