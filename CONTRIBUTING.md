# Contributing to @2run/logger

Thank you for your interest in contributing to @2run/logger! This document provides guidelines and instructions for contributing.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue on GitHub with:

- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (Node.js version, React Native version, etc.)
- Code samples or screenshots if applicable

### Suggesting Features

Feature suggestions are welcome! Please create an issue with:

- Clear description of the feature
- Use cases and benefits
- Examples of how it would work
- Alternative solutions considered

### Pull Requests

1. **Fork the repository** and create a new branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes** following our coding standards
4. **Add tests** for new functionality
5. **Run tests**: `npm test`
6. **Run linting**: `npm run lint`
7. **Run type checking**: `npm run typecheck`
8. **Update documentation** if needed
9. **Commit your changes** with a clear commit message
10. **Push to your fork** and create a pull request

## Development Setup

```bash
# Clone the repository
git clone https://github.com/halilertekin/logger.git
cd logger

# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Run type checking
npm run typecheck

# Build the package
npm run build
```

## Coding Standards

- **TypeScript**: Use strict mode, no `any` types
- **Testing**: Maintain >80% code coverage
- **Formatting**: Use Prettier (runs automatically on commit)
- **Linting**: Follow ESLint rules (runs automatically on commit)
- **Commits**: Use conventional commit messages

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

Examples:
```
feat(transport): add HTTP transport for remote logging
fix(file): resolve file rotation issue on Windows
docs(readme): add examples for custom transports
```

## Testing

All contributions must include tests. We use Jest for testing.

- Write unit tests for new functionality
- Update existing tests if behavior changes
- Ensure all tests pass before submitting PR
- Aim for 100% code coverage on new code

## Documentation

- Update README.md for new features
- Add JSDoc comments for public APIs
- Update CHANGELOG.md following Keep a Changelog format
- Add examples for new functionality

## Release Process

Releases are managed by maintainers:

1. Update version in package.json
2. Update CHANGELOG.md
3. Create git tag
4. Push to GitHub
5. GitHub Actions auto-publishes to npm

## Questions?

Feel free to:
- Open an issue for questions
- Join discussions on GitHub
- Email us at info@vetaversevet.com

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to @2run/logger! 🎉
