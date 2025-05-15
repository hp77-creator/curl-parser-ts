# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-05-15

### Added
- Initial release of curl-parser-ts
- Support for parsing curl commands into structured objects
- TypeScript support with type definitions
- Support for various curl options:
  - HTTP methods (GET, POST, PUT, DELETE, etc.)
  - Headers
  - Request body data
  - URL query parameters
  - Authentication
  - Cookies
  - Timeout settings
  - Redirect following
  - Insecure connections
  - Compressed responses
  - Form data (both URL-encoded and multipart)
- Comprehensive test suite
- Performance benchmarks against parse-curl
- Memory usage benchmarks

## [0.2.0] - 2025-05-15

### Added

- Handle quoted url in a curl string