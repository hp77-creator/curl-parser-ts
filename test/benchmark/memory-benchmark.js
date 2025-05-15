/**
 * Memory usage benchmark for curl-parser-ts vs parse-curl
 * 
 * This script measures the memory usage of both libraries when parsing
 * a large number of curl commands.
 */

const parseCurl = require('parse-curl');
const { parseCurlCommand } = require('../../dist');

// Ensure btoa is defined for Node.js environment
global.btoa = str => Buffer.from(str).toString('base64');

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

// Number of iterations to run
const ITERATIONS = 10000;

// Helper function to measure memory usage
function getMemoryUsage() {
  const memoryUsage = process.memoryUsage();
  return {
    rss: memoryUsage.rss / 1024 / 1024, // RSS in MB
    heapTotal: memoryUsage.heapTotal / 1024 / 1024, // Heap total in MB
    heapUsed: memoryUsage.heapUsed / 1024 / 1024, // Heap used in MB
  };
}

// Helper function to format memory usage
function formatMemory(memory) {
  return {
    rss: `${memory.rss.toFixed(2)} MB`,
    heapTotal: `${memory.heapTotal.toFixed(2)} MB`,
    heapUsed: `${memory.heapUsed.toFixed(2)} MB`,
  };
}

// Helper function to run benchmark
function runBenchmark(parser, name) {
  console.log(`\nRunning memory benchmark for ${name}...`);
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  } else {
    console.warn('No garbage collection hook! Run with --expose-gc for more accurate results.');
  }
  
  const startMemory = getMemoryUsage();
  console.log(`Initial memory usage: `, formatMemory(startMemory));
  
  const startTime = process.hrtime();
  
  // Run the parser many times
  for (let i = 0; i < ITERATIONS; i++) {
    // Use all test cases in each iteration
    for (const testCase of testCases) {
      parser(testCase);
    }
  }
  
  const endTime = process.hrtime(startTime);
  const duration = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
  
  const endMemory = getMemoryUsage();
  console.log(`Final memory usage: `, formatMemory(endMemory));
  
  const memoryDiff = {
    rss: endMemory.rss - startMemory.rss,
    heapTotal: endMemory.heapTotal - startMemory.heapTotal,
    heapUsed: endMemory.heapUsed - startMemory.heapUsed,
  };
  
  console.log(`Memory increase: `, formatMemory(memoryDiff));
  console.log(`Time taken: ${duration} ms`);
  
  return {
    duration: parseFloat(duration),
    memoryDiff
  };
}

// Run benchmarks
console.log(`Running memory benchmark with ${ITERATIONS} iterations for each library...`);
console.log(`Each iteration processes ${testCases.length} different curl commands.`);
console.log(`Total curl commands processed: ${ITERATIONS * testCases.length}`);

const parseCurlResults = runBenchmark(parseCurl, 'parse-curl');
const curlParserTsResults = runBenchmark(parseCurlCommand, 'curl-parser-ts');

// Compare results
console.log('\n=== COMPARISON ===');
const timeRatio = (parseCurlResults.duration / curlParserTsResults.duration).toFixed(2);
const memoryRatio = (parseCurlResults.memoryDiff.heapUsed / curlParserTsResults.memoryDiff.heapUsed).toFixed(2);

console.log(`Time: curl-parser-ts is ${timeRatio}x ${timeRatio > 1 ? 'faster' : 'slower'} than parse-curl`);
console.log(`Memory: curl-parser-ts uses ${memoryRatio}x ${memoryRatio > 1 ? 'more' : 'less'} memory than parse-curl`);

console.log('\nNote: For more accurate memory measurements, run with:');
console.log('node --expose-gc test/memory-benchmark.js');
