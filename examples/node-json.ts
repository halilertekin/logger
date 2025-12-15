/**
 * Node.js JSON logging example for @2run/logger
 * Useful for production environments with log aggregation services
 */

import { createLogger, JSONFormatter, ConsoleTransport } from '@2run/logger';

// Create a logger with JSON output
const logger = createLogger({
  prefix: 'MyApp',
  transports: [new ConsoleTransport(new JSONFormatter())],
  defaultMetadata: {
    appVersion: '1.0.0',
    environment: 'production',
    hostname: process.env.HOSTNAME || 'unknown',
  },
});

// Example 1: Simple JSON logging
console.log('=== Example 1: Simple JSON Logging ===');
logger.info('Application started');
logger.info('User logged in', { userId: 123, username: 'john.doe' });

// Example 2: Error logging with stack traces
console.log('\n=== Example 2: Error Logging ===');
try {
  throw new Error('Database connection failed');
} catch (error) {
  logger.error('Database error occurred', {
    error,
    errorCode: 'DB_CONN_001',
    retryAttempt: 3,
  });
}

// Example 3: Complex metadata
console.log('\n=== Example 3: Complex Metadata ===');
logger.info('API request completed', {
  request: {
    method: 'POST',
    url: '/api/users',
    body: { name: 'John Doe' },
  },
  response: {
    statusCode: 201,
    duration: 45,
  },
  metadata: {
    requestId: 'req-123-abc',
    userId: 456,
  },
});

// Example 4: Circular reference handling
console.log('\n=== Example 4: Circular Reference Handling ===');
const circular: { name: string; self?: unknown } = { name: 'circular' };
circular.self = circular;

logger.info('Circular reference test', { circular });

// Example 5: Performance timing
console.log('\n=== Example 5: Performance Timing ===');
const startTime = Date.now();

// Simulate some work
setTimeout(() => {
  const duration = Date.now() - startTime;
  logger.info('Operation completed', {
    operation: 'data-processing',
    duration,
    recordsProcessed: 1000,
  });
}, 100);

console.log('\n=== JSON Examples Complete ===');
