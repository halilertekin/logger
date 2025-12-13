/**
 * Log severity levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Log entry structure
 */
export interface LogEntry {
  /** Unique identifier for the log entry */
  id: string;
  /** Log severity level */
  level: LogLevel;
  /** Log message */
  message: string;
  /** Additional metadata/context */
  metadata?: Record<string, unknown>;
  /** Unix timestamp in milliseconds */
  timestamp: number;
}

/**
 * Listener function for log subscriptions
 */
export type LogListener = (entry: LogEntry) => void;

/**
 * Platform information
 */
export interface PlatformInfo {
  platform: string;
  version: string;
}

/**
 * Transport interface for log output
 */
export interface Transport {
  /** Log a single entry */
  log(entry: LogEntry): void | Promise<void>;
  /** Flush any buffered logs */
  flush?(): void | Promise<void>;
  /** Close/cleanup the transport */
  close?(): void | Promise<void>;
}

/**
 * Formatter interface for log formatting
 */
export interface Formatter {
  /** Format a log entry to string */
  format(entry: LogEntry, platformInfo?: PlatformInfo): string;
}

/**
 * Logger configuration options
 */
export interface LoggerConfig {
  /** Prefix for log messages (default: '') */
  prefix?: string;
  /** Maximum number of log entries to keep in history (default: 200) */
  maxHistory?: number;
  /** Minimum log level to emit (default: 'debug' in dev, 'warn' in production) */
  minLogLevel?: LogLevel;
  /** Include platform information in logs (default: true) */
  platformInfo?: boolean;
  /** Custom transports (default: [ConsoleTransport]) */
  transports?: Transport[];
  /** Custom formatter (default: TextFormatter) */
  formatter?: Formatter;
  /** Default metadata to include in all logs */
  defaultMetadata?: Record<string, unknown>;
  /** Custom correlation ID generator */
  correlationIdGenerator?: () => string;
}

/**
 * File transport options
 */
export interface FileTransportOptions {
  /** File path for logs */
  filePath: string;
  /** Maximum file size in bytes before rotation (default: 10MB) */
  maxFileSize?: number;
  /** Maximum number of rotated files to keep (default: 5) */
  maxFiles?: number;
  /** Buffer size before flushing to disk (default: 100) */
  bufferSize?: number;
}

/**
 * Logger instance interface
 */
export interface Logger {
  /** Log a debug message */
  debug(message: string, metadata?: Record<string, unknown>): void;
  /** Log an info message */
  info(message: string, metadata?: Record<string, unknown>): void;
  /** Log a warning message */
  warn(message: string, metadata?: Record<string, unknown>): void;
  /** Log an error message */
  error(message: string, metadata?: Record<string, unknown>): void;
  /** Get log history */
  getHistory(): LogEntry[];
  /** Subscribe to log events */
  subscribe(listener: LogListener): () => void;
  /** Flush all logs to console with platform info */
  flushToConsole(): void;
  /** Close all transports and cleanup */
  close(): Promise<void>;
}
