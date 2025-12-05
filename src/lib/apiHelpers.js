import { NextResponse } from 'next/server';

/**
 * Standard error response handler
 * Logs detailed errors server-side, returns generic messages to client
 */
export function handleApiError(error, context = '') {
  // Log full error details server-side
  console.error(`API Error${context ? ` [${context}]` : ''}:`, {
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  });

  // Determine appropriate status code
  let statusCode = 500;
  let message = 'An error occurred';

  // Handle known error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = error.message;
  } else if (error.message?.includes('Unauthorized') || error.message?.includes('unauthorized')) {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (error.message?.includes('Forbidden') || error.message?.includes('forbidden')) {
    statusCode = 403;
    message = 'Forbidden';
  } else if (error.message?.includes('not found') || error.message?.includes('Not found')) {
    statusCode = 404;
    message = 'Not found';
  } else if (error.message?.includes('duplicate') || error.message?.includes('already exists')) {
    statusCode = 409;
    message = error.message;
  }

  // In development, include more details
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.json(
      {
        message,
        error: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      },
      { status: statusCode }
    );
  }

  // In production, return generic message
  return NextResponse.json(
    { message },
    { status: statusCode }
  );
}

/**
 * Validation error class
 */
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Input validators
 */
export const validators = {
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }
    return email.toLowerCase().trim();
  },

  password: (password) => {
    if (!password || password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long');
    }
    return password;
  },

  username: (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      throw new ValidationError(
        'Username must be 3-20 characters and contain only letters, numbers, and underscores'
      );
    }
    return username.trim();
  },

  required: (value, fieldName) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      throw new ValidationError(`${fieldName} is required`);
    }
    return value;
  },

  positiveInteger: (value, fieldName) => {
    const num = parseInt(value);
    if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
      throw new ValidationError(`${fieldName} must be a positive integer`);
    }
    return num;
  },

  positiveNumber: (value, fieldName) => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      throw new ValidationError(`${fieldName} must be a positive number`);
    }
    return num;
  },
};

/**
 * Rate limiting helper (basic in-memory implementation)
 * For production, use Redis or a proper rate limiting service
 */
const rateLimitMap = new Map();

export function checkRateLimit(identifier, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(identifier) || [];
  
  // Remove old requests outside the time window
  const recentRequests = userRequests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }
  
  recentRequests.push(now);
  rateLimitMap.set(identifier, recentRequests);
  
  // Cleanup old entries periodically
  if (rateLimitMap.size > 10000) {
    rateLimitMap.clear();
  }
  
  return true;
}
