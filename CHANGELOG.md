# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-13

### Added

- Initial release of @2run/logger
- Core logger with debug, info, warn, error methods
- TypeScript support with strict mode
- Platform detection (Node.js, React Native, Web)
- Pluggable transport system
  - ConsoleTransport for console output
  - FileTransport for Node.js file logging with rotation
- Pluggable formatter system
  - TextFormatter for human-readable output
  - JSONFormatter for structured logging
- Log history with configurable size (default: 200)
- Subscription system for log event listening
- Environment-based log level filtering
- Safe metadata serialization (circular references, Error objects)
- Async file writes with buffering
- Correlation ID support
- Default metadata support
- Platform information in logs (optional)
- Comprehensive test suite (42 tests, 100% coverage)
- Full TypeScript type definitions
- Dual CJS/ESM builds
- Zero runtime dependencies

### Features

- Works in Node.js 14+
- Works in React Native 0.60+
- Works in modern browsers
- Tree-shakeable
- Minified builds
- Sourcemaps included

[1.0.0]: https://github.com/halilertekin/logger/releases/tag/v1.0.0
