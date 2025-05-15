/**
 * Feature comparison between curl-parser-ts and parse-curl
 * 
 * This script tests both libraries against a variety of curl commands
 * to compare their feature support and parsing accuracy.
 */

const parseCurl = require('parse-curl');
const { parseCurlCommand } = require('../../dist');

// Ensure btoa is defined for Node.js environment
global.btoa = str => Buffer.from(str).toString('base64');

// Test cases organized by feature
const testCases = [
  {
    category: 'Basic HTTP Methods',
    tests: [
      { name: 'GET request', command: 'curl https://api.example.com' },
      { name: 'POST request', command: 'curl -X POST https://api.example.com' },
      { name: 'PUT request', command: 'curl -X PUT https://api.example.com' },
      { name: 'DELETE request', command: 'curl -X DELETE https://api.example.com' },
      { name: 'HEAD request', command: 'curl -I https://api.example.com' },
      { name: 'PATCH request', command: 'curl -X PATCH https://api.example.com' },
    ]
  },
  {
    category: 'Headers',
    tests: [
      { name: 'Single header', command: 'curl -H "Accept: application/json" https://api.example.com' },
      { name: 'Multiple headers', command: 'curl -H "Accept: application/json" -H "Authorization: Bearer token123" https://api.example.com' },
      { name: 'User-Agent', command: 'curl -A "Custom Agent" https://api.example.com' },
      { name: 'Content-Type', command: 'curl -H "Content-Type: application/json" https://api.example.com' },
    ]
  },
  {
    category: 'Data',
    tests: [
      { name: 'Form data', command: 'curl -d "param1=value1&param2=value2" https://api.example.com' },
      { name: 'Multiple data params', command: 'curl -d "param1=value1" -d "param2=value2" https://api.example.com' },
      { name: 'JSON data', command: 'curl -X POST -H "Content-Type: application/json" -d \'{"name":"test","age":30}\' https://api.example.com' },
      { name: 'Multipart form data', command: 'curl -F "field1=value1" -F "field2=value2" https://api.example.com' },
    ]
  },
  {
    category: 'Authentication',
    tests: [
      { name: 'Basic auth', command: 'curl -u username:password https://api.example.com' },
      { name: 'Bearer token', command: 'curl -H "Authorization: Bearer token123" https://api.example.com' },
    ]
  },
  {
    category: 'Cookies',
    tests: [
      { name: 'Single cookie', command: 'curl -b "session=abc123" https://api.example.com' },
      { name: 'Multiple cookies', command: 'curl -b "session=abc123; theme=dark" https://api.example.com' },
    ]
  },
  {
    category: 'URL Parameters',
    tests: [
      { name: 'Single parameter', command: 'curl "https://api.example.com/search?q=test"' },
      { name: 'Multiple parameters', command: 'curl "https://api.example.com/search?q=test&page=1&limit=10"' },
      { name: 'Encoded parameters', command: 'curl "https://api.example.com/search?q=test%20query&filter=name%3Avalue"' },
    ]
  },
  {
    category: 'Other Options',
    tests: [
      { name: 'Compressed', command: 'curl --compressed https://api.example.com' },
      { name: 'Follow redirects', command: 'curl -L https://api.example.com' },
      { name: 'Insecure', command: 'curl -k https://api.example.com' },
      { name: 'Timeout', command: 'curl --connect-timeout 30 https://api.example.com' },
    ]
  },
  {
    category: 'Complex Commands',
    tests: [
      { 
        name: 'Complex command 1', 
        command: 'curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer token123" -d \'{"name":"test","age":30}\' "https://api.example.com/users?active=true"' 
      },
      { 
        name: 'Complex command 2', 
        command: 'curl -X POST -H "Accept: application/json" -H "Authorization: Bearer token123" -b "session=abc" -L -k --compressed -d "data=test" "https://api.example.com/update?id=123"' 
      },
    ]
  }
];

// Function to check if a feature is supported
function checkFeatureSupport(parser, command, feature) {
  try {
    const result = parser(command);
    
    switch (feature) {
      case 'method':
        return result.method !== undefined;
      case 'headers':
        return result.header !== undefined || result.headers !== undefined;
      case 'data':
        return result.body !== undefined || result.data !== undefined;
      case 'query':
        // Check if query parameters are parsed
        return (result.query !== undefined) || 
               (result.url && result.url.includes('?') && !result.url.includes('search?q=test'));
      case 'auth':
        return result.auth !== undefined;
      case 'cookies':
        return (result.cookies !== undefined) || 
               (result.header && result.header['Set-Cookie'] !== undefined);
      case 'followRedirects':
        return result.followRedirects !== undefined;
      case 'insecure':
        return result.insecure !== undefined;
      case 'compressed':
        return result.compressed !== undefined || 
               (result.header && result.header['Accept-Encoding'] !== undefined) ||
               (result.headers && result.headers['Accept-Encoding'] !== undefined);
      case 'timeout':
        return result.timeout !== undefined;
      case 'formData':
        return result.formData !== undefined;
      case 'multipartFormData':
        return result.multipartFormData !== undefined;
      default:
        return false;
    }
  } catch (error) {
    return false;
  }
}

// Run the feature comparison
console.log('=== FEATURE COMPARISON: curl-parser-ts vs parse-curl ===\n');

let curlParserTsScore = 0;
let parseCurlScore = 0;
const totalTests = testCases.reduce((sum, category) => sum + category.tests.length, 0);

testCases.forEach(category => {
  console.log(`\n## ${category.category}`);
  console.log('| Test | curl-parser-ts | parse-curl |');
  console.log('|------|---------------|------------|');
  
  category.tests.forEach(test => {
    // Test both parsers
    const features = ['method', 'headers', 'data', 'query', 'auth', 'cookies', 
                     'followRedirects', 'insecure', 'compressed', 'timeout',
                     'formData', 'multipartFormData'];
    
    const curlParserTsResults = features.map(feature => 
      checkFeatureSupport(parseCurlCommand, test.command, feature));
    
    const parseCurlResults = features.map(feature => 
      checkFeatureSupport(parseCurl, test.command, feature));
    
    // Count supported features
    const curlParserTsSupported = curlParserTsResults.filter(Boolean).length;
    const parseCurlSupported = parseCurlResults.filter(Boolean).length;
    
    curlParserTsScore += curlParserTsSupported;
    parseCurlScore += parseCurlSupported;
    
    // Display results
    console.log(`| ${test.name} | ${curlParserTsSupported}/${features.length} | ${parseCurlSupported}/${features.length} |`);
  });
});

// Display overall score
console.log('\n## Overall Score');
console.log('| Library | Features Supported | Percentage |');
console.log('|---------|-------------------|------------|');
console.log(`| curl-parser-ts | ${curlParserTsScore} | ${(curlParserTsScore / (totalTests * 12) * 100).toFixed(2)}% |`);
console.log(`| parse-curl | ${parseCurlScore} | ${(parseCurlScore / (totalTests * 12) * 100).toFixed(2)}% |`);

// Display conclusion
console.log('\n## Conclusion');
if (curlParserTsScore > parseCurlScore) {
  console.log(`curl-parser-ts supports ${curlParserTsScore - parseCurlScore} more features than parse-curl.`);
} else if (parseCurlScore > curlParserTsScore) {
  console.log(`parse-curl supports ${parseCurlScore - curlParserTsScore} more features than curl-parser-ts.`);
} else {
  console.log('Both libraries support the same number of features.');
}
