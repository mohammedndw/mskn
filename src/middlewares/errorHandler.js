const logger = require('../utils/logger');
const { ZodError } = require('zod');
const { Prisma } = require('@prisma/client');

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;

    switch (err.code) {
      case 'P2002':
        message = 'A record with this value already exists';
        errors = { field: err.meta?.target, message: 'Unique constraint violation' };
        break;
      case 'P2025':
        message = 'Record not found';
        statusCode = 404;
        break;
      case 'P2003':
        message = 'Foreign key constraint failed';
        break;
      default:
        message = 'Database operation failed';
    }
  }

  // Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Business logic errors - return 400 instead of 500
  const businessErrors = [
    'Property not found',
    'Tenant not found',
    'Contract not found',
    'Property already has an active contract',
    'End date must be after start date',
    'Access denied',
    'New property already has an active contract',
    'Invalid data provided',
    'Invalid payment frequency'
  ];

  if (statusCode === 500 && businessErrors.some(e => message.includes(e))) {
    statusCode = 400;
  }

  // Not found errors
  if (message.includes('not found') && statusCode === 500) {
    statusCode = 404;
  }

  // Access denied errors
  if (message.includes('Access denied') && statusCode !== 401) {
    statusCode = 403;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 handler
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler
};
