import type { Formatter, LogEntry, PlatformInfo } from '../types';

/**
 * JSON formatter for structured logging
 * Handles circular references and Error objects safely
 */
export class JSONFormatter implements Formatter {
  /**
   * Safe JSON stringification with circular reference handling
   */
  private safeStringify(obj: unknown): unknown {
    const seen = new WeakSet();

    return JSON.parse(
      JSON.stringify(obj, (_key, value) => {
        // Handle Error objects
        if (value instanceof Error) {
          return {
            name: value.name,
            message: value.message,
            stack: value.stack,
          };
        }

        // Handle circular references
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular Reference]';
          }
          seen.add(value);
        }

        // Handle undefined
        if (value === undefined) {
          return null;
        }

        // Handle functions
        if (typeof value === 'function') {
          return '[Function]';
        }

        return value;
      })
    );
  }

  format(entry: LogEntry, platformInfo?: PlatformInfo): string {
    const logObject = {
      timestamp: new Date(entry.timestamp).toISOString(),
      level: entry.level,
      message: entry.message,
      id: entry.id,
      metadata: entry.metadata ? this.safeStringify(entry.metadata) : undefined,
      platform: platformInfo
        ? {
            name: platformInfo.platform,
            version: platformInfo.version,
          }
        : undefined,
    };

    return JSON.stringify(logObject);
  }
}
