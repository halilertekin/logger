import * as fs from 'fs';
import * as path from 'path';
import type { Transport, LogEntry, Formatter, FileTransportOptions } from '../types';
import { TextFormatter } from '../formatters/text-formatter';

/**
 * File transport for logging to files with rotation support
 * Node.js only - uses fs module
 */
export class FileTransport implements Transport {
  private buffer: string[] = [];
  private currentFileSize = 0;
  private readonly filePath: string;
  private readonly maxFileSize: number;
  private readonly maxFiles: number;
  private readonly bufferSize: number;
  private writeStream: fs.WriteStream | null = null;
  private isClosed = false;

  constructor(
    options: FileTransportOptions,
    private formatter: Formatter = new TextFormatter()
  ) {
    this.filePath = options.filePath;
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB default
    this.maxFiles = options.maxFiles || 5;
    this.bufferSize = options.bufferSize || 100;

    // Ensure directory exists
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Get current file size if exists
    if (fs.existsSync(this.filePath)) {
      this.currentFileSize = fs.statSync(this.filePath).size;
    }

    // Initialize write stream
    this.initWriteStream();
  }

  private initWriteStream(): void {
    this.writeStream = fs.createWriteStream(this.filePath, {
      flags: 'a', // append mode
      encoding: 'utf8',
    });

    this.writeStream.on('error', (error) => {
      console.error('[FileTransport] Write stream error:', error);
    });
  }

  private rotateFile(): void {
    if (this.writeStream) {
      this.writeStream.end();
      this.writeStream = null;
    }

    // Rotate existing files
    for (let i = this.maxFiles - 1; i >= 0; i--) {
      const oldPath = i === 0 ? this.filePath : `${this.filePath}.${i}`;
      const newPath = `${this.filePath}.${i + 1}`;

      if (fs.existsSync(oldPath)) {
        if (i === this.maxFiles - 1) {
          // Delete the oldest file
          fs.unlinkSync(oldPath);
        } else {
          // Rename to next number
          fs.renameSync(oldPath, newPath);
        }
      }
    }

    // Reset current file size and reinit stream
    this.currentFileSize = 0;
    this.initWriteStream();
  }

  async log(entry: LogEntry): Promise<void> {
    if (this.isClosed) {
      return;
    }

    const formatted = this.formatter.format(entry) + '\n';
    this.buffer.push(formatted);

    // Check if we need to flush
    if (this.buffer.length >= this.bufferSize) {
      await this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0 || this.isClosed) {
      return;
    }

    const content = this.buffer.join('');
    this.buffer = [];

    // Check if we need to rotate
    if (this.currentFileSize + content.length > this.maxFileSize) {
      this.rotateFile();
    }

    return new Promise((resolve, reject) => {
      if (!this.writeStream) {
        reject(new Error('Write stream not initialized'));
        return;
      }

      this.writeStream.write(content, (error) => {
        if (error) {
          console.error('[FileTransport] Write error:', error);
          reject(error);
        } else {
          this.currentFileSize += content.length;
          resolve();
        }
      });
    });
  }

  async close(): Promise<void> {
    if (this.isClosed) {
      return;
    }

    // Flush remaining buffer BEFORE setting isClosed
    if (this.buffer.length > 0) {
      await this.flush();
    }

    // Now set closed flag
    this.isClosed = true;

    // Close write stream and wait for it to finish
    return new Promise((resolve) => {
      if (this.writeStream) {
        this.writeStream.end(() => {
          this.writeStream = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
