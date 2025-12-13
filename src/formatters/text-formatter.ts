import type { Formatter, LogEntry, PlatformInfo } from '../types';

/**
 * Text formatter for human-readable log output
 */
export class TextFormatter implements Formatter {
  constructor(private prefix: string = '') {}

  format(entry: LogEntry, platformInfo?: PlatformInfo): string {
    const prefixPart = this.prefix ? `[${this.prefix}]` : '';
    const levelPart = `[${entry.level.toUpperCase()}]`;
    const parts = [prefixPart, levelPart].filter(Boolean);

    let formatted = parts.length > 0 ? `${parts.join('')} ${entry.message}` : entry.message;

    // Add metadata if present
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      formatted += ` ${JSON.stringify(entry.metadata)}`;
    }

    // Add platform info if provided
    if (platformInfo) {
      formatted += ` [${platformInfo.platform}/${platformInfo.version}]`;
    }

    return formatted;
  }
}
