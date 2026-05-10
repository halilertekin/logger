import * as https from 'https';
import type { Transport, LogEntry, Formatter, DiscordTransportOptions, PlatformInfo } from '../types';
import { JSONFormatter } from '../formatters/json-formatter';

/**
 * Discord transport for sending logs to a Discord webhook
 * Universal: works in Node.js, React Native, and Browser
 */
export class DiscordTransport implements Transport {
  private readonly webhookUrl: string;
  private readonly formatter: Formatter;
  private readonly platformInfo?: PlatformInfo;

  constructor(
    options: DiscordTransportOptions,
    formatter?: Formatter,
    platformInfo?: PlatformInfo
  ) {
    this.webhookUrl = options.webhookUrl;
    this.formatter = formatter || new JSONFormatter();
    this.platformInfo = platformInfo;
  }

  async log(entry: LogEntry): Promise<void> {
    try {
      const formatted = this.formatter.format(entry, this.platformInfo);
      
      const payload = {
        content: `**[${entry.level.toUpperCase()}]** ${entry.message}`,
        embeds: [
          {
            description: `\`\`\`json\n${formatted}\n\`\`\``,
            color: this.getColor(entry.level),
            timestamp: new Date(entry.timestamp).toISOString(),
          },
        ],
      };

      const payloadString = JSON.stringify(payload);

      // Use native fetch if available (Node 18+, React Native, Browser)
      if (typeof fetch !== 'undefined') {
        await fetch(this.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payloadString,
        });
        return;
      }

      // Fallback to https for older Node.js environments
      return new Promise((resolve, reject) => {
        const url = new URL(this.webhookUrl);
        const req = https.request(
          url,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payloadString),
            },
          },
          (res) => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve();
            } else {
              reject(new Error(`Discord API error: ${res.statusCode}`));
            }
          }
        );

        req.on('error', reject);
        req.write(payloadString);
        req.end();
      });
    } catch (error) {
      console.error('[DiscordTransport] Failed to send log to Discord', error);
    }
  }

  private getColor(level: string): number {
    switch (level) {
      case 'error':
        return 0xff0000; // Red
      case 'warn':
        return 0xffa500; // Orange
      case 'info':
        return 0x00ff00; // Green
      case 'debug':
        return 0x808080; // Gray
      default:
        return 0xffffff; // White
    }
  }
}
