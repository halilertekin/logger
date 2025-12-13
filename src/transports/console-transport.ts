import type { Transport, LogEntry, Formatter, PlatformInfo } from '../types';
import { TextFormatter } from '../formatters/text-formatter';

/**
 * Console transport for logging to console output
 */
export class ConsoleTransport implements Transport {
  constructor(
    private formatter: Formatter = new TextFormatter(),
    private platformInfo?: PlatformInfo
  ) {}

  log(entry: LogEntry): void {
    const formatted = this.formatter.format(entry, this.platformInfo);

    switch (entry.level) {
      case 'error':
        console.error(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'debug':
      case 'info':
      default:
        console.log(formatted);
        break;
    }
  }
}
