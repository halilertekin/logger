import { TextFormatter, JSONFormatter } from '../formatters';
import type { LogEntry } from '../types';

describe('TextFormatter', () => {
  let formatter: TextFormatter;
  let entry: LogEntry;

  beforeEach(() => {
    formatter = new TextFormatter();
    entry = {
      id: 'test-1',
      level: 'info',
      message: 'Test message',
      timestamp: Date.now(),
    };
  });

  it('should format log entry without prefix', () => {
    const result = formatter.format(entry);
    expect(result).toBe('[INFO] Test message');
  });

  it('should format log entry with prefix', () => {
    formatter = new TextFormatter('MyApp');
    const result = formatter.format(entry);
    expect(result).toBe('[MyApp][INFO] Test message');
  });

  it('should include metadata', () => {
    entry.metadata = { userId: 123, action: 'login' };
    const result = formatter.format(entry);
    expect(result).toContain('[INFO] Test message');
    expect(result).toContain('{"userId":123,"action":"login"}');
  });

  it('should include platform info', () => {
    const result = formatter.format(entry, { platform: 'node', version: 'v18.0.0' });
    expect(result).toContain('[INFO] Test message');
    expect(result).toContain('[node/v18.0.0]');
  });

  it('should handle error level', () => {
    entry.level = 'error';
    const result = formatter.format(entry);
    expect(result).toContain('[ERROR]');
  });
});

describe('JSONFormatter', () => {
  let formatter: JSONFormatter;
  let entry: LogEntry;

  beforeEach(() => {
    formatter = new JSONFormatter();
    entry = {
      id: 'test-1',
      level: 'info',
      message: 'Test message',
      timestamp: 1234567890000,
    };
  });

  it('should format log entry as valid JSON', () => {
    const result = formatter.format(entry);
    const parsed = JSON.parse(result);
    expect(parsed.level).toBe('info');
    expect(parsed.message).toBe('Test message');
    expect(parsed.id).toBe('test-1');
    expect(parsed.timestamp).toBe('2009-02-13T23:31:30.000Z');
  });

  it('should include platform info in JSON', () => {
    const result = formatter.format(entry, { platform: 'node', version: 'v18.0.0' });
    const parsed = JSON.parse(result);
    expect(parsed.platform).toEqual({
      name: 'node',
      version: 'v18.0.0',
    });
  });

  it('should handle circular references in metadata', () => {
    const circular: { name: string; self?: unknown } = { name: 'test' };
    circular.self = circular;
    entry.metadata = { circular };

    const result = formatter.format(entry);
    const parsed = JSON.parse(result);
    expect(parsed.metadata.circular.self).toBe('[Circular Reference]');
  });

  it('should handle Error objects in metadata', () => {
    const error = new Error('Test error');
    entry.metadata = { error };

    const result = formatter.format(entry);
    const parsed = JSON.parse(result);
    expect(parsed.metadata.error.name).toBe('Error');
    expect(parsed.metadata.error.message).toBe('Test error');
    expect(parsed.metadata.error.stack).toBeDefined();
  });

  it('should handle undefined values', () => {
    entry.metadata = { value: undefined };
    const result = formatter.format(entry);
    const parsed = JSON.parse(result);
    expect(parsed.metadata.value).toBeNull();
  });

  it('should handle function values', () => {
    entry.metadata = { fn: () => 'test' };
    const result = formatter.format(entry);
    const parsed = JSON.parse(result);
    expect(parsed.metadata.fn).toBe('[Function]');
  });
});
