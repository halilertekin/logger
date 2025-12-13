# @2run/logger

[![npm version](https://img.shields.io/npm/v/@2run/logger.svg)](https://www.npmjs.com/package/@2run/logger)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

Lightweight, type-safe logger with history, transports, and JSON support for Node.js and React Native.

## Features

- ✅ **TypeScript First**: Full type safety with strict mode
- ✅ **Zero Dependencies**: No external runtime dependencies
- ✅ **Platform Agnostic**: Works in Node.js, React Native, and browsers
- ✅ **Pluggable Transports**: Console, file, or custom transports
- ✅ **Multiple Formatters**: Text or JSON output
- ✅ **Log History**: Configurable in-memory history
- ✅ **Subscriptions**: Listen to log events in real-time
- ✅ **Log Filtering**: Environment-based log level filtering
- ✅ **File Rotation**: Automatic file rotation for Node.js
- ✅ **Safe Serialization**: Handles circular references and Error objects
- ✅ **Async Support**: Non-blocking file writes with buffering

## Installation

```bash
npm install @2run/logger
# or
yarn add @2run/logger
# or
pnpm add @2run/logger
```

## Quick Start

### Basic Usage

```typescript
import { logger } from '@2run/logger';

// Simple logging
logger.info('Application started');
logger.debug('Debug information', { userId: 123 });
logger.warn('Warning message');
logger.error('Error occurred', { error: new Error('Something went wrong') });
```

### Custom Logger with Configuration

```typescript
import { createLogger, JSONFormatter, FileTransport } from '@2run/logger';

const logger = createLogger({
  prefix: 'MyApp',
  minLogLevel: 'info',
  maxHistory: 500,
  defaultMetadata: { appVersion: '1.0.0' },
});

logger.info('Configured logger ready');
```

### JSON Logging (Structured Logs)

```typescript
import { createLogger, JSONFormatter, ConsoleTransport } from '@2run/logger';

const logger = createLogger({
  transports: [new ConsoleTransport(new JSONFormatter())],
});

logger.info('User action', { userId: 123, action: 'login' });
// Output: {"timestamp":"2025-12-13T10:30:00.000Z","level":"info","message":"User action","id":"...","metadata":{"userId":123,"action":"login"}}
```

### File Logging (Node.js)

```typescript
import { createLogger, FileTransport } from '@2run/logger';

const logger = createLogger({
  transports: [
    new FileTransport({
      filePath: './logs/app.log',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
  ],
});

logger.info('This will be written to file');
```

### Multiple Transports

```typescript
import { createLogger, ConsoleTransport, FileTransport, JSONFormatter } from '@2run/logger';

const logger = createLogger({
  transports: [
    new ConsoleTransport(), // Console output
    new FileTransport({ filePath: './logs/app.log' }), // File output
    new FileTransport(
      { filePath: './logs/app.json.log' },
      new JSONFormatter() // JSON file output
    ),
  ],
});

logger.info('Logged to console and two files');
```

### Log Subscriptions

```typescript
import { logger } from '@2run/logger';

// Subscribe to all log events
const unsubscribe = logger.subscribe((entry) => {
  console.log('Log event:', entry);
  // Send to analytics, remote logging service, etc.
});

logger.info('This will trigger the subscription');

// Unsubscribe when done
unsubscribe();
```

### React Native Integration

```typescript
import { createLogger } from '@2run/logger';

// Logger automatically detects React Native platform
const logger = createLogger({
  prefix: 'MyApp',
  platformInfo: true, // Includes iOS/Android version info
});

logger.info('Running on React Native');
// Output: [MyApp][INFO] Running on React Native [ios/14.5]
```

## API Reference

### `createLogger(config?): Logger`

Creates a new logger instance with the given configuration.

**Parameters:**

- `config` (optional): `LoggerConfig`
  - `prefix` (string): Prefix for log messages (default: '')
  - `maxHistory` (number): Maximum history size (default: 200)
  - `minLogLevel` (LogLevel): Minimum log level to emit (default: 'debug' in dev, 'warn' in production)
  - `platformInfo` (boolean): Include platform info (default: true)
  - `transports` (Transport[]): Custom transports (default: [ConsoleTransport])
  - `formatter` (Formatter): Custom formatter (default: TextFormatter)
  - `defaultMetadata` (Record<string, unknown>): Default metadata for all logs
  - `correlationIdGenerator` (() => string): Custom ID generator

**Returns:** `Logger` instance

### Logger Methods

#### `logger.debug(message, metadata?)`

Logs a debug message.

#### `logger.info(message, metadata?)`

Logs an info message.

#### `logger.warn(message, metadata?)`

Logs a warning message.

#### `logger.error(message, metadata?)`

Logs an error message.

#### `logger.getHistory(): LogEntry[]`

Returns a copy of the log history.

#### `logger.subscribe(listener): () => void`

Subscribes to log events. Returns an unsubscribe function.

#### `logger.flushToConsole()`

Flushes all history to console with [History] tag.

#### `logger.close(): Promise<void>`

Closes all transports and flushes pending logs.

## TypeScript Types

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

interface Transport {
  log(entry: LogEntry): void | Promise<void>;
  flush?(): void | Promise<void>;
  close?(): void | Promise<void>;
}

interface Formatter {
  format(entry: LogEntry, platformInfo?: PlatformInfo): string;
}
```

## Examples

### Example: Custom Transport

```typescript
import { createLogger } from '@2run/logger';
import type { Transport, LogEntry } from '@2run/logger';

class RemoteTransport implements Transport {
  async log(entry: LogEntry) {
    await fetch('https://api.example.com/logs', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }
}

const logger = createLogger({
  transports: [new RemoteTransport()],
});
```

### Example: Conditional Logging

```typescript
import { createLogger } from '@2run/logger';

const logger = createLogger({
  minLogLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
});

// This will only log in development
logger.debug('Debug info');

// This will log in all environments
logger.error('Critical error');
```

### Example: Correlation IDs

```typescript
import { createLogger } from '@2run/logger';
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger({
  correlationIdGenerator: () => uuidv4(),
});

logger.info('Request started'); // ID: abc-123-def
logger.info('Processing'); // ID: xyz-456-ghi
```

## Performance Considerations

- **Async File Writes**: File transport uses buffering and async writes to avoid blocking
- **Log History**: Limited to configurable size (default: 200 entries)
- **Lazy Serialization**: Metadata is only serialized when needed
- **Level Filtering**: Logs below minimum level are filtered before transport
- **Zero Dependencies**: No runtime overhead from external packages

## Best Practices

1. **Use appropriate log levels**: debug < info < warn < error
2. **Include contextual metadata**: Add relevant data to help debugging
3. **Configure per environment**: Use debug in development, warn+ in production
4. **Handle sensitive data**: Don't log passwords, tokens, or PII
5. **Use structured logging**: JSON format for production logs
6. **Implement log rotation**: Prevent disk space issues in long-running apps
7. **Clean up subscriptions**: Always unsubscribe when components unmount

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © [2Run](https://github.com/2run)

## Support

- 📧 Email: [halil@2run.be](mailto:halil@2run.be)
- 🐛 Issues: [GitHub Issues](https://github.com/2run/logger/issues)
- 📖 Documentation: [API Docs](https://github.com/2run/logger#readme)

---

Made with ❤️ by the 2Run team
