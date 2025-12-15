/**
 * React Native usage example for @2run/logger
 */

import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView } from 'react-native';
import { createLogger, type LogEntry } from '@2run/logger';

// Create a logger instance with React Native optimizations
const logger = createLogger({
  prefix: 'MyReactNativeApp',
  minLogLevel: __DEV__ ? 'debug' : 'warn',
  platformInfo: true, // Will include iOS/Android version
  maxHistory: 100,
});

const LoggingExample: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    // Subscribe to log events to display in UI
    const unsubscribe = logger.subscribe((entry) => {
      setLogs((prev) => [...prev.slice(-20), entry]); // Keep last 20 logs
    });

    logger.info('App component mounted');

    return () => {
      logger.info('App component unmounted');
      unsubscribe();
    };
  }, []);

  const handleDebugLog = () => {
    logger.debug('Debug button pressed', {
      timestamp: new Date().toISOString(),
    });
  };

  const handleInfoLog = () => {
    logger.info('Info button pressed', {
      userId: 123,
      action: 'button_click',
    });
  };

  const handleWarningLog = () => {
    logger.warn('Warning! Low memory', {
      memoryUsage: '85%',
    });
  };

  const handleErrorLog = () => {
    logger.error('Error occurred', {
      error: new Error('Something went wrong'),
      errorCode: 'ERR_001',
    });
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Logger Example</Text>

      <View style={{ gap: 10, marginBottom: 20 }}>
        <Button title="Debug Log" onPress={handleDebugLog} />
        <Button title="Info Log" onPress={handleInfoLog} />
        <Button title="Warning Log" onPress={handleWarningLog} color="orange" />
        <Button title="Error Log" onPress={handleErrorLog} color="red" />
      </View>

      <Text style={{ fontSize: 16, marginBottom: 10 }}>Recent Logs:</Text>
      <ScrollView style={{ flex: 1 }}>
        {logs.map((log) => (
          <View
            key={log.id}
            style={{
              padding: 10,
              marginBottom: 5,
              backgroundColor: '#f0f0f0',
              borderRadius: 5,
            }}
          >
            <Text style={{ fontWeight: 'bold' }}>[{log.level.toUpperCase()}]</Text>
            <Text>{log.message}</Text>
            {log.metadata && (
              <Text style={{ fontSize: 12, color: '#666' }}>
                {JSON.stringify(log.metadata, null, 2)}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default LoggingExample;
