const Benchmark = require('benchmark');
const parseCurl = require('parse-curl');
const { parseCurlCommand } = require('../dist');

// Ensure btoa is defined for Node.js environment
global.btoa = str => Buffer.from(str).toString('base64');

// Create a benchmark suite
const suite = new Benchmark.Suite;

// Test cases of varying complexity
const testCases = [
  // Simple cases
  'curl http://api.example.com',
  'curl -I https://api.example.com',
  
  // Medium complexity
  'curl -H "Accept: application/json" -X POST https://api.example.com',
  'curl -u username:password https://api.example.com/secure',
  'curl -d "param1=value1&param2=value2" https://api.example.com/form',
  
  // Complex cases
  'curl -X POST -H "Content-Type: application/json" -d \'{"name":"test","age":30}\' https://api.example.com/data',
  'curl -X POST -H "Accept: application/json" -H "Authorization: Bearer token123" -b "session=abc" -L -k --compressed -d "data=test" "https://api.example.com/update?id=123"'
];

// Add tests for each case
testCases.forEach(testCase => {
  const shortDesc = testCase.length > 30 ? testCase.substring(0, 30) + '...' : testCase;
  
  suite.add(`parse-curl: ${shortDesc}`, function() {
    parseCurl(testCase);
  })
  .add(`curl-parser-ts: ${shortDesc}`, function() {
    parseCurlCommand(testCase);
  });
});

// Add listeners
suite.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
  
  // Calculate and display average performance difference
  const parseCurlResults = [];
  const curlParserTsResults = [];
  
  this.forEach(benchmark => {
    if (benchmark.name.startsWith('parse-curl')) {
      parseCurlResults.push(benchmark.hz);
    } else {
      curlParserTsResults.push(benchmark.hz);
    }
  });
  
  const parseCurlAvg = parseCurlResults.reduce((a, b) => a + b, 0) / parseCurlResults.length;
  const curlParserTsAvg = curlParserTsResults.reduce((a, b) => a + b, 0) / curlParserTsResults.length;
  
  console.log('\nAverage operations per second:');
  console.log(`parse-curl: ${parseCurlAvg.toFixed(2)} ops/sec`);
  console.log(`curl-parser-ts: ${curlParserTsAvg.toFixed(2)} ops/sec`);
  
  const percentDiff = ((curlParserTsAvg - parseCurlAvg) / parseCurlAvg * 100).toFixed(2);
  console.log(`\ncurl-parser-ts is ${percentDiff}% ${percentDiff >= 0 ? 'faster' : 'slower'} than parse-curl on average`);
})
.run({ 'async': true });
