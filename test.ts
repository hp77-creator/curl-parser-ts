import { parseCurlCommand } from './src/index';

const curlCommand = `curl -X POST 'https://api.example.com/data?id=123' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer token123' \\
  -d '{"name": "John", "age": 30}'`;

const parsedCommand = parseCurlCommand(curlCommand);
console.log(parsedCommand);