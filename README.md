# curl-parser-ts

[![npm version](https://img.shields.io/npm/v/curl-parser-ts.svg)](https://www.npmjs.com/package/curl-parser-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.0%2B-blue)](https://www.typescriptlang.org/)

A TypeScript library for parsing curl commands into structured objects. Convert curl commands from the command line into JavaScript objects that can be used in your code.

## Features

- 🚀 **TypeScript Support**: Built with TypeScript for better developer experience and type safety
- 🔍 **Comprehensive Parsing**: Handles a wide range of curl options and flags
- 🧩 **Structured Output**: Converts curl commands into well-structured JavaScript objects
- 🔄 **Query Parameter Parsing**: Automatically extracts and parses URL query parameters
- 🍪 **Cookie Support**: Parses cookie strings into structured objects
- 📦 **Zero Dependencies**: Lightweight with no runtime dependencies

## Installation

```bash
npm install curl-parser-ts
# or
yarn add curl-parser-ts
```

## Usage

### Basic Usage

```typescript
import { parseCurlCommand } from 'curl-parser-ts';

const curlCommand = `curl -X POST 'https://api.example.com/data?id=123' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer token123' \
  -d '{"name": "John", "age": 30}'`;

const parsedCommand = parseCurlCommand(curlCommand);
console.log(parsedCommand);
```

Output:

```javascript
{
  method: 'POST',
  url: 'https://api.example.com/data',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123'
  },
  query: {
    'id': '123'
  },
  data: '{"name": "John", "age": 30}',
  auth: null,
  cookies: {},
  timeout: null,
  proxy: null,
  followRedirects: false,
  insecure: false,
  compressed: false,
  formData: null,
  multipartFormData: null
}
```

### Advanced Usage

```typescript
import { parseCurlCommand, tokenizeFromCurl } from 'curl-parser-ts';

// If you need access to the raw tokens
const tokens = tokenizeFromCurl(`curl -H "Accept: application/json" https://api.example.com`);
console.log(tokens);

// Parse a more complex curl command
const complexCommand = `curl -X POST -H "Accept: application/json" -H "Authorization: Bearer token123" \
  -b "session=abc" -L -k --compressed -d "data=test" "https://api.example.com/update?id=123"`;

const parsed = parseCurlCommand(complexCommand);
console.log(parsed);
```

## API Reference

### `parseCurlCommand(curlCommand: string): CurlParseResult`

Parses a curl command string and returns a structured object.

#### Parameters

- `curlCommand` - A string containing the curl command to parse

#### Return Value

Returns a `CurlParseResult` object with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `url` | `string` | The URL from the curl command |
| `method` | `string` | The HTTP method (GET, POST, PUT, DELETE, etc.) |
| `headers` | `Record<string, string>` | HTTP headers |
| `query` | `Record<string, string>` | URL query parameters |
| `data` | `string \| null` | Request body data |
| `auth` | `string \| null` | Authentication credentials |
| `cookies` | `Record<string, string>` | Cookies |
| `timeout` | `string \| null` | Request timeout |
| `proxy` | `string \| null` | Proxy settings |
| `followRedirects` | `boolean` | Whether to follow redirects |
| `insecure` | `boolean` | Whether to allow insecure connections |
| `compressed` | `boolean` | Whether to request compressed response |
| `formData` | `Record<string, string> \| null` | Form data for application/x-www-form-urlencoded |
| `multipartFormData` | `Record<string, string> \| null` | Multipart form data |

### `tokenizeFromCurl(curlCommand: string): Token[]`

Tokenizes a curl command string into an array of tokens.

#### Parameters

- `curlCommand` - A string containing the curl command to tokenize

#### Return Value

Returns an array of `Token` objects with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `type` | `'OPTION' \| 'ARGUMENT' \| 'URL'` | The type of token |
| `value` | `string` | The value of the token |
| `raw` | `string` | The raw string representation of the token |

## Supported Curl Options

curl-parser-ts supports a wide range of curl options, including:

| Option | Description |
|--------|-------------|
| `-X, --request` | HTTP method (GET, POST, PUT, DELETE, etc.) |
| `-H, --header` | HTTP headers |
| `-d, --data` | Request body data |
| `-F, --form` | Multipart form data |
| `-b, --cookie` | Cookies |
| `-u, --user` | Authentication credentials |
| `-A, --user-agent` | User agent |
| `-L, --location` | Follow redirects |
| `-k, --insecure` | Allow insecure connections |
| `--compressed` | Request compressed response |
| `-I` | HEAD request |
| `--connect-timeout` | Connection timeout |
| `-m` | Maximum time allowed for the transfer |

## Comparison with Similar Packages

| Feature | curl-parser-ts | parse-curl |
|---------|---------------|------------|
| TypeScript Support | ✅ | ❌ |
| Query Parameter Parsing | ✅ | ❌ |
| Cookie Parsing | ✅ | ✅ |
| Multipart Form Data | ✅ | ❌ |
| Follow Redirects | ✅ | ❌ |
| Timeout Support | ✅ | ❌ |
| Proxy Support | ✅ | ❌ |
| Compressed Response | ✅ | ✅ |
| Bundle Size | Smaller | Larger |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Inspired by [parse-curl](https://github.com/tj/parse-curl)
