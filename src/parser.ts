import { CurlParseResult } from "./types";
import { tokenizeFromCurl } from "./tokenizer";

function parseCurlCommand(curlCommand: string): CurlParseResult {
    const tokens = tokenizeFromCurl(curlCommand);

    console.log('Tokens:', tokens);
    
    // Initialize result object with defaults
    const result: CurlParseResult = {
      url: '',
      method: 'GET',
      headers: {} as Record<string, string>,
      query: {} as Record<string, string>,
      data: null,
      auth: null,
      cookies: {} as Record<string, string>,
      timeout: null,
      proxy: null,
      followRedirects: false,
      insecure: false,
      compressed: false,
      formData: null,
      multipartFormData: null,
    };
    
    // Process tokens
    let urlFound = false;
    for (let i = tokens.length - 1; i >= 0; i--) {
      const token = tokens[i];
      if (token.type === 'URL' || (token.type === 'ARGUMENT' && (
        token.value.match(/^https?:\/\//) ||
        token.value.match(/^[^.]+\.[^.]+/) 
      ))) {
        result.url = token.value;
        urlFound = true;
        break;
      }
    }

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const nextToken = tokens[i + 1];
      
      if (token.type === 'URL') {
        continue;
      }
      if (token.type === 'OPTION') {
        switch (true) {
          case token.value === '-I':
            result.method = 'HEAD';
            break;
          case token.value === '--compressed':
            result.compressed = true;
            if (!result.headers['Accept-Encoding']) {
              result.headers['Accept-Encoding'] = 'deflate, gzip';
            }
            break;
          case /^-X[A-Z]+$/.test(token.value):
            result.method = token.value.substring(2).toUpperCase();
            break;
          case token.value === '-X' || token.value === '--request':
            if (nextToken) {
              result.method = nextToken.value.toUpperCase();
              i++; // Skip the next token as we've consumed it
            }
            break;
            
          case token.value === '-H':
          case token.value ==='--header':
            if (nextToken) {
              const headerMatch = nextToken.value.match(/^([^:]+):\s*(.*)$/);
              if (headerMatch) {
                const [, name, value] = headerMatch;
                result.headers[name] = value;
              }
              i++; // Skip the next token
            }
            break;
            
          case token.value ==='-d':
          case token.value ==='--data':
          case token.value ==='--data-raw':
            if (nextToken) {
              result.data = nextToken.value;
              result.method = result.method === 'GET' ? 'POST' : result.method;
              i++;
            }
            break;
        }
      }
    }
    
    // Extra processing (like parsing query params from URL)
    if (result.url.includes('?')) {
      const [baseUrl, queryString] = result.url.split('?');
      result.url = baseUrl;
      
      // Parse query parameters
      queryString.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        if (key) {
          result.query[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
        }
      });
    }
    
    return result;
  }



export {parseCurlCommand};
