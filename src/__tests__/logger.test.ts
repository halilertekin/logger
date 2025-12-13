import { createLogger, logger } from '../logger';
import type { LogEntry, Transport } from '../types';

// Mock transport for testing
class MockTransport implements Transport {
  logs: LogEntry[] = [];

  log(entry: LogEntry): void {
    this.logs.push(entry);
  }

  clear(): void {
    this.logs = [];
  }
}

describe('createLogger', () => {
  let mockTransport: MockTransport;

  beforeEach(() => {
    mockTransport = new MockTransport();
  });

  it('should create a logger instance', () => {
    const instance = createLogger();
    expect(instance).toBeDefined();
    expect(instance.debug).toBeDefined();
    expect(instance.info).toBeDefined();
    expect(instance.warn).toBeDefined();
    expect(instance.error).toBeDefined();
  });

  it('should log debug messages', () => {
    const instance = createLogger({
      transports: [mockTransport],
      minLogLevel: 'debug',
    });

    instance.debug('Debug message');
    expect(mockTransport.logs).toHaveLength(1);
    expect(mockTransport.logs[0].level).toBe('debug');
    expect(mockTransport.logs[0].message).toBe('Debug message');
  });

  it('should log info messages', () => {
    const instance = createLogger({ transports: [mockTransport] });
    instance.info('Info message');
    expect(mockTransport.logs).toHaveLength(1);
    expect(mockTransport.logs[0].level).toBe('info');
  });

  it('should log warn messages', () => {
    const instance = createLogger({ transports: [mockTransport] });
    instance.warn('Warn message');
    expect(mockTransport.logs).toHaveLength(1);
    expect(mockTransport.logs[0].level).toBe('warn');
  });

  it('should log error messages', () => {
    const instance = createLogger({ transports: [mockTransport] });
    instance.error('Error message');
    expect(mockTransport.logs).toHaveLength(1);
    expect(mockTransport.logs[0].level).toBe('error');
  });

  it('should include metadata in logs', () => {
    const instance = createLogger({ transports: [mockTransport] });
    instance.info('Message', { userId: 123 });
    expect(mockTransport.logs[0].metadata).toEqual({ userId: 123 });
  });

  it('should merge default metadata with log metadata', () => {
    const instance = createLogger({
      transports: [mockTransport],
      defaultMetadata: { appVersion: '1.0.0' },
    });
    instance.info('Message', { userId: 123 });
    expect(mockTransport.logs[0].metadata).toEqual({
      appVersion: '1.0.0',
      userId: 123,
    });
  });

  it('should filter logs by minimum log level', () => {
    const instance = createLogger({
      transports: [mockTransport],
      minLogLevel: 'warn',
    });

    instance.debug('Debug message');
    instance.info('Info message');
    instance.warn('Warn message');
    instance.error('Error message');

    expect(mockTransport.logs).toHaveLength(2);
    expect(mockTransport.logs[0].level).toBe('warn');
    expect(mockTransport.logs[1].level).toBe('error');
  });

  it('should maintain log history', () => {
    const instance = createLogger({ transports: [mockTransport] });
    instance.info('Message 1');
    instance.warn('Message 2');
    instance.error('Message 3');

    const history = instance.getHistory();
    expect(history).toHaveLength(3);
    expect(history[0].message).toBe('Message 1');
    expect(history[1].message).toBe('Message 2');
    expect(history[2].message).toBe('Message 3');
  });

  it('should limit history size', () => {
    const instance = createLogger({
      transports: [mockTransport],
      maxHistory: 2,
    });

    instance.info('Message 1');
    instance.info('Message 2');
    instance.info('Message 3');

    const history = instance.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].message).toBe('Message 2');
    expect(history[1].message).toBe('Message 3');
  });

  it('should support subscriptions', () => {
    const instance = createLogger({ transports: [mockTransport] });
    const listener = jest.fn();

    instance.subscribe(listener);
    instance.info('Test message');

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].message).toBe('Test message');
  });

  it('should support unsubscribing', () => {
    const instance = createLogger({ transports: [mockTransport] });
    const listener = jest.fn();

    const unsubscribe = instance.subscribe(listener);
    instance.info('Message 1');
    unsubscribe();
    instance.info('Message 2');

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should generate unique IDs for log entries', () => {
    const instance = createLogger({ transports: [mockTransport] });
    instance.info('Message 1');
    instance.info('Message 2');

    expect(mockTransport.logs[0].id).not.toBe(mockTransport.logs[1].id);
  });

  it('should use custom correlation ID generator', () => {
    let counter = 0;
    const instance = createLogger({
      transports: [mockTransport],
      correlationIdGenerator: () => `custom-${++counter}`,
    });

    instance.info('Message 1');
    instance.info('Message 2');

    expect(mockTransport.logs[0].id).toBe('custom-1');
    expect(mockTransport.logs[1].id).toBe('custom-2');
  });

  it('should flush logs to console with history tag', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const instance = createLogger();

    instance.info('Test message');
    instance.flushToConsole();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[History]'),
      expect.any(Object)
    );

    consoleSpy.mockRestore();
  });

  it('should handle errors in listeners gracefully', () => {
    const instance = createLogger({ transports: [mockTransport] });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const badListener = jest.fn().mockImplementation(() => {
      throw new Error('Listener error');
    });

    instance.subscribe(badListener);
    instance.info('Test message');

    // Should still log to transport
    expect(mockTransport.logs).toHaveLength(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('[Logger] Listener error:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  it('should close all transports', async () => {
    const transport1 = {
      log: jest.fn(),
      close: jest.fn().mockResolvedValue(undefined),
    };
    const transport2 = {
      log: jest.fn(),
      flush: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
    };

    const instance = createLogger({
      transports: [transport1, transport2],
    });

    await instance.close();

    expect(transport1.close).toHaveBeenCalled();
    expect(transport2.flush).toHaveBeenCalled();
    expect(transport2.close).toHaveBeenCalled();
  });
});

describe('default logger', () => {
  it('should be a logger instance', () => {
    expect(logger).toBeDefined();
    expect(logger.debug).toBeDefined();
    expect(logger.info).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.error).toBeDefined();
  });

  it('should maintain history', () => {
    const initialLength = logger.getHistory().length;
    logger.info('Test message');
    expect(logger.getHistory().length).toBe(initialLength + 1);
  });
});
