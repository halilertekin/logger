/**
 * Node.js file logging example for @vetaverse/logger
 * Demonstrates file rotation and multiple log files
 */

import { createLogger, FileTransport, JSONFormatter, TextFormatter } from '@vetaverse/logger';
import * as path from 'path';

// Create logs directory
const logsDir = path.join(process.cwd(), 'logs');

// Example 1: Basic file logging
console.log('=== Example 1: Basic File Logging ===');
const fileLogger = createLogger({
  transports: [
    new FileTransport({
      filePath: path.join(logsDir, 'app.log'),
    }),
  ],
});

fileLogger.info('Application started');
fileLogger.info('Processing data', { records: 100 });
fileLogger.warn('Memory usage high', { usage: '85%' });

// Example 2: JSON file logging
console.log('\n=== Example 2: JSON File Logging ===');
const jsonLogger = createLogger({
  transports: [
    new FileTransport(
      {
        filePath: path.join(logsDir, 'app.json.log'),
        maxFileSize: 5 * 1024 * 1024, // 5MB
        maxFiles: 3,
      },
      new JSONFormatter()
    ),
  ],
});

jsonLogger.info('JSON log entry', { userId: 123 });
jsonLogger.error('Error occurred', { error: new Error('Test error') });

// Example 3: Multiple log files (app logs + error logs)
console.log('\n=== Example 3: Multiple Log Files ===');
const multiLogger = createLogger({
  transports: [
    // All logs go to app.log
    new FileTransport({
      filePath: path.join(logsDir, 'all-logs.log'),
    }),
    // Only errors go to error.log (manual filtering needed in transport)
    new FileTransport({
      filePath: path.join(logsDir, 'errors.log'),
    }),
  ],
});

multiLogger.info('Info message');
multiLogger.warn('Warning message');
multiLogger.error('Error message');

// Example 4: Log rotation demonstration
console.log('\n=== Example 4: Log Rotation ===');
const rotatingLogger = createLogger({
  transports: [
    new FileTransport({
      filePath: path.join(logsDir, 'rotating.log'),
      maxFileSize: 1024, // Very small for demo (1KB)
      maxFiles: 3,
      bufferSize: 1, // Flush immediately for demo
    }),
  ],
});

// Write enough logs to trigger rotation
for (let i = 0; i < 20; i++) {
  rotatingLogger.info(`Log message number ${i}`, {
    index: i,
    data: 'Some data to make the log bigger',
  });
}

// Example 5: Graceful shutdown
console.log('\n=== Example 5: Graceful Shutdown ===');
const shutdownLogger = createLogger({
  transports: [
    new FileTransport({
      filePath: path.join(logsDir, 'shutdown.log'),
      bufferSize: 100, // Large buffer
    }),
  ],
});

shutdownLogger.info('Application starting');
shutdownLogger.info('Processing data');
shutdownLogger.info('Application shutting down');

// Close logger to flush buffer
shutdownLogger.close().then(() => {
  console.log('Logger closed gracefully');
});

console.log('\n=== File Examples Complete ===');
console.log(`Logs written to: ${logsDir}`);
