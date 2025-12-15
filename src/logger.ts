import type {
  LogLevel,
  LogEntry,
  LogListener,
  PlatformInfo,
  Logger,
  LoggerConfig,
  Transport,
} from './types';
import { ConsoleTransport } from './transports/console-transport';
import { TextFormatter } from './formatters/text-formatter';

/**
 * Detect platform information safely
 */
function getPlatformInfo(): PlatformInfo {
  try {
    // Try React Native first
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Platform } = require('react-native');
    return { platform: Platform.OS, version: String(Platform.Version) };
  } catch {
    // Fall back to Node.js or browser detection
    // Check if window exists (browser environment)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const globalWindow = typeof globalThis !== 'undefined' ? (globalThis as any).window : undefined;
    if (globalWindow && globalWindow.navigator) {
      return { platform: 'web', version: globalWindow.navigator.userAgent };
    }
    if (typeof process !== 'undefined' && process.versions?.node) {
      return { platform: 'node', version: process.version };
    }
    return { platform: 'unknown', version: 'unknown' };
  }
}

/**
 * Check if running in development mode
 */
function isDevelopment(): boolean {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
  }
  // For React Native, check __DEV__ global
  if (typeof globalThis !== 'undefined' && '__DEV__' in globalThis) {
    return (globalThis as unknown as { __DEV__: boolean }).__DEV__;
  }
  return false;
}

/**
 * Log level priorities for filtering
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Create a logger instance with the given configuration
 */
export function createLogger(config?: LoggerConfig): Logger {
  const {
    prefix = '',
    maxHistory = 200,
    minLogLevel = isDevelopment() ? 'debug' : 'warn',
    platformInfo = true,
    transports: customTransports,
    formatter: customFormatter,
    defaultMetadata = {},
    correlationIdGenerator,
  } = config || {};

  // Platform info
  const platform = platformInfo ? getPlatformInfo() : undefined;

  // Set up formatter
  const formatter = customFormatter || new TextFormatter(prefix);

  // Set up transports
  const transports: Transport[] = customTransports || [new ConsoleTransport(formatter, platform)];

  // Log history and subscribers
  const history: LogEntry[] = [];
  const listeners = new Set<LogListener>();

  /**
   * Check if a log should be emitted based on log level
   */
  const shouldLog = (level: LogLevel): boolean => {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[minLogLevel];
  };

  /**
   * Emit a log entry to all transports and listeners
   */
  const emit = async (entry: LogEntry): Promise<void> => {
    // Always store in history for debugging
    history.push(entry);
    if (history.length > maxHistory) {
      history.shift();
    }

    // Notify listeners
    listeners.forEach((listener) => {
      try {
        listener(entry);
      } catch (error) {
        console.error('[Logger] Listener error:', error);
      }
    });

    // Only emit to transports if it meets minimum log level
    if (!shouldLog(entry.level)) {
      return;
    }

    // Send to all transports
    await Promise.all(
      transports.map(async (transport) => {
        try {
          await transport.log(entry);
        } catch (error) {
          console.error('[Logger] Transport error:', error);
        }
      })
    );
  };

  /**
   * Generate a unique ID for log entry
   */
  const generateId =
    correlationIdGenerator ||
    (() => {
      return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    });

  /**
   * Create a log entry
   */
  const log = (level: LogLevel, message: string, metadata?: Record<string, unknown>): void => {
    const entry: LogEntry = {
      id: generateId(),
      level,
      message,
      metadata: metadata ? { ...defaultMetadata, ...metadata } : defaultMetadata,
      timestamp: Date.now(),
    };

    // Fire and forget for async transports
    void emit(entry);
  };

  // Logger instance
  return {
    debug: (message: string, metadata?: Record<string, unknown>) => log('debug', message, metadata),
    info: (message: string, metadata?: Record<string, unknown>) => log('info', message, metadata),
    warn: (message: string, metadata?: Record<string, unknown>) => log('warn', message, metadata),
    error: (message: string, metadata?: Record<string, unknown>) => log('error', message, metadata),

    getHistory: () => [...history],

    subscribe: (listener: LogListener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    flushToConsole: () => {
      history.forEach((entry) => {
        const prefixPart = prefix ? `[${prefix}]` : '';
        const levelPart = `[${entry.level.toUpperCase()}]`;
        const historyTag = '[History]';
        const parts = [prefixPart, levelPart, historyTag, entry.message].filter(Boolean);
        const formatted = parts.join(' ');

        const metadata = { ...entry.metadata, platform };

        if (entry.level === 'error') {
          console.error(formatted, metadata);
        } else if (entry.level === 'warn') {
          console.warn(formatted, metadata);
        } else {
          console.log(formatted, metadata);
        }
      });
    },

    close: async () => {
      await Promise.all(
        transports.map(async (transport) => {
          try {
            if (transport.flush) {
              await transport.flush();
            }
            if (transport.close) {
              await transport.close();
            }
          } catch (error) {
            console.error('[Logger] Error closing transport:', error);
          }
        })
      );
    },
  };
}

/**
 * Default logger instance for simple usage
 */
export const logger = createLogger();
