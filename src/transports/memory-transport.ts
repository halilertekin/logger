import type {
  Transport,
  LogEntry,
  Formatter,
  MemoryTransportOptions,
  PlatformInfo,
} from '../types';
import { TextFormatter } from '../formatters/text-formatter';

/**
 * Memory transport for keeping logs in an array
 * Useful for React Native debug screens or testing
 */
export class MemoryTransport implements Transport {
  private logs: string[] = [];
  private readonly limit: number;
  private readonly formatter: Formatter;
  private readonly platformInfo?: PlatformInfo;

  constructor(
    options: MemoryTransportOptions = {},
    formatter?: Formatter,
    platformInfo?: PlatformInfo
  ) {
    this.limit = options.limit || 1000;
    this.formatter = formatter || new TextFormatter();
    this.platformInfo = platformInfo;
  }

  log(entry: LogEntry): void {
    const formatted = this.formatter.format(entry, this.platformInfo);
    this.logs.push(formatted);

    if (this.logs.length > this.limit) {
      this.logs.shift();
    }
  }

  /**
   * Get all formatted logs from memory
   */
  getLogs(): string[] {
    return [...this.logs];
  }

  /**
   * Clear all logs from memory
   */
  clear(): void {
    this.logs = [];
  }
}
