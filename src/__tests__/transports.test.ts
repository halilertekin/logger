import * as fs from 'node:fs';
import * as path from 'node:path';
import { ConsoleTransport, FileTransport, MemoryTransport, DiscordTransport } from '../transports';
import { TextFormatter, JSONFormatter } from '../formatters';
import type { LogEntry } from '../types';

describe('ConsoleTransport', () => {
  let transport: ConsoleTransport;
  let entry: LogEntry;
  let consoleSpy: {
    log: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
  };

  beforeEach(() => {
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
    };

    transport = new ConsoleTransport(new TextFormatter());
    entry = {
      id: 'test-1',
      level: 'info',
      message: 'Test message',
      timestamp: Date.now(),
    };
  });

  afterEach(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.warn.mockRestore();
    consoleSpy.error.mockRestore();
  });

  it('should log info messages to console.log', () => {
    transport.log(entry);
    expect(consoleSpy.log).toHaveBeenCalledWith('[INFO] Test message');
  });

  it('should log warn messages to console.warn', () => {
    entry.level = 'warn';
    transport.log(entry);
    expect(consoleSpy.warn).toHaveBeenCalledWith('[WARN] Test message');
  });

  it('should log error messages to console.error', () => {
    entry.level = 'error';
    transport.log(entry);
    expect(consoleSpy.error).toHaveBeenCalledWith('[ERROR] Test message');
  });

  it('should use JSON formatter when provided', () => {
    transport = new ConsoleTransport(new JSONFormatter());
    transport.log(entry);
    const call = consoleSpy.log.mock.calls[0][0];
    const parsed = JSON.parse(call);
    expect(parsed.level).toBe('info');
  });

  it('should include platform info when provided', () => {
    transport = new ConsoleTransport(new TextFormatter(), {
      platform: 'node',
      version: 'v18.0.0',
    });
    transport.log(entry);
    expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('[node/v18.0.0]'));
  });
});

describe('FileTransport', () => {
  const testDir = path.join(__dirname, '.test-logs');
  const testFilePath = path.join(testDir, 'test.log');
  let transport: FileTransport;
  let entry: LogEntry;

  beforeEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testDir, { recursive: true });

    entry = {
      id: 'test-1',
      level: 'info',
      message: 'Test message',
      timestamp: Date.now(),
    };
  });

  afterEach(async () => {
    if (transport) {
      await transport.close();
    }
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should create log file if it does not exist', async () => {
    transport = new FileTransport({ filePath: testFilePath, bufferSize: 1 });
    await transport.log(entry);
    await transport.flush();

    expect(fs.existsSync(testFilePath)).toBe(true);
  });

  it('should write log entries to file', async () => {
    transport = new FileTransport({ filePath: testFilePath, bufferSize: 1 });
    await transport.log(entry);
    await transport.flush();

    const content = fs.readFileSync(testFilePath, 'utf-8');
    expect(content).toContain('[INFO] Test message');
  });

  it('should buffer logs before flushing', async () => {
    transport = new FileTransport({ filePath: testFilePath, bufferSize: 5 });
    await transport.log(entry);

    // File should not exist yet (buffered)
    expect(fs.existsSync(testFilePath)).toBe(false);

    await transport.flush();

    // Now file should exist
    expect(fs.existsSync(testFilePath)).toBe(true);
  });

  it('should auto-flush when buffer is full', async () => {
    transport = new FileTransport({ filePath: testFilePath, bufferSize: 2 });
    await transport.log(entry);
    await transport.log(entry);

    // Give it a moment to flush
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(fs.existsSync(testFilePath)).toBe(true);
  });

  it('should rotate file when max size is reached', async () => {
    const smallMaxSize = 100; // Very small to trigger rotation
    transport = new FileTransport({
      filePath: testFilePath,
      maxFileSize: smallMaxSize,
      bufferSize: 1,
    });

    // Write enough logs to trigger rotation
    for (let i = 0; i < 10; i++) {
      await transport.log({ ...entry, message: `Message ${i}` });
      await transport.flush();
    }

    // Check if rotated files exist
    const rotatedFile = `${testFilePath}.1`;
    expect(fs.existsSync(testFilePath)).toBe(true);
    expect(fs.existsSync(rotatedFile)).toBe(true);
  });

  it('should use JSON formatter when provided', async () => {
    transport = new FileTransport({ filePath: testFilePath, bufferSize: 1 }, new JSONFormatter());
    await transport.log(entry);
    await transport.flush();

    const content = fs.readFileSync(testFilePath, 'utf-8');
    const parsed = JSON.parse(content.trim());
    expect(parsed.level).toBe('info');
  });

  it('should gracefully handle close', async () => {
    transport = new FileTransport({ filePath: testFilePath, bufferSize: 5 });
    await transport.log(entry);
    await transport.close();

    // Give it a moment for async writes
    await new Promise((resolve) => setTimeout(resolve, 50));

    const content = fs.readFileSync(testFilePath, 'utf-8');
    expect(content).toContain('[INFO] Test message');
  });
});

describe('MemoryTransport', () => {
  let transport: MemoryTransport;
  let entry: LogEntry;

  beforeEach(() => {
    transport = new MemoryTransport();
    entry = {
      id: 'test-1',
      level: 'info',
      message: 'Test message',
      timestamp: Date.now(),
    };
  });

  it('should store log entries', () => {
    transport.log(entry);
    const logs = transport.getLogs();
    expect(logs.length).toBe(1);
    expect(logs[0]).toContain('[INFO] Test message');
  });

  it('should respect the log limit', () => {
    transport = new MemoryTransport({ limit: 2 });
    transport.log({ ...entry, message: 'Message 1' });
    transport.log({ ...entry, message: 'Message 2' });
    transport.log({ ...entry, message: 'Message 3' });

    const logs = transport.getLogs();
    expect(logs.length).toBe(2);
    expect(logs[0]).toContain('Message 2');
    expect(logs[1]).toContain('Message 3');
  });

  it('should clear logs', () => {
    transport.log(entry);
    transport.clear();
    expect(transport.getLogs().length).toBe(0);
  });

  it('should use JSON formatter when provided', () => {
    transport = new MemoryTransport({}, new JSONFormatter());
    transport.log(entry);

    const logs = transport.getLogs();
    const parsed = JSON.parse(logs[0]);
    expect(parsed.level).toBe('info');
    expect(parsed.message).toBe('Test message');
  });
});

describe('DiscordTransport', () => {
  let transport: DiscordTransport;
  let entry: LogEntry;
  let globalFetchSpy: jest.SpyInstance;

  beforeEach(() => {
    transport = new DiscordTransport({ webhookUrl: 'https://discord.com/api/webhooks/test/test' });
    entry = {
      id: 'test-1',
      level: 'info',
      message: 'Test message',
      timestamp: Date.now(),
    };

    // Mock global fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    ) as jest.Mock;
    globalFetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    globalFetchSpy.mockRestore();
  });

  it('should send log entry via fetch', async () => {
    await transport.log(entry);

    expect(globalFetchSpy).toHaveBeenCalledTimes(1);
    expect(globalFetchSpy).toHaveBeenCalledWith(
      'https://discord.com/api/webhooks/test/test',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const requestBody = JSON.parse(globalFetchSpy.mock.calls[0][1].body);
    expect(requestBody.content).toContain('**[INFO]** Test message');
    expect(requestBody.embeds[0].color).toBe(0x00ff00);
  });
});
