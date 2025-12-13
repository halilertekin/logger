/**
 * Basic usage example for @vetaverse/logger
 */

import { logger, createLogger } from '@vetaverse/logger';

// Example 1: Using the default logger
console.log('=== Example 1: Default Logger ===');
logger.debug('Debug message');
logger.info('Info message', { userId: 123 });
logger.warn('Warning message');
logger.error('Error message', { error: new Error('Something went wrong') });

// Example 2: Creating a custom logger
console.log('\n=== Example 2: Custom Logger ===');
const customLogger = createLogger({
  prefix: 'MyApp',
  minLogLevel: 'info',
  defaultMetadata: {
    appVersion: '1.0.0',
    environment: 'production',
  },
});

customLogger.info('Application started');
customLogger.warn('Low disk space', { diskUsage: '95%' });

// Example 3: Log history
console.log('\n=== Example 3: Log History ===');
logger.info('Message 1');
logger.info('Message 2');
logger.info('Message 3');

const history = logger.getHistory();
console.log(`Total logs in history: ${history.length}`);
console.log('Recent logs:', history.slice(-3));

// Example 4: Subscriptions
console.log('\n=== Example 4: Subscriptions ===');
const unsubscribe = logger.subscribe((entry) => {
  console.log(`[Subscriber] Received ${entry.level} log: ${entry.message}`);
});

logger.info('This will trigger the subscription');
logger.warn('This will also trigger the subscription');

unsubscribe();
logger.info('This will NOT trigger the subscription (unsubscribed)');

// Example 5: Flush to console
console.log('\n=== Example 5: Flush History ===');
logger.flushToConsole();

console.log('\n=== Examples Complete ===');
