import { CurlParseResult } from "./types";
import { tokenizeFromCurl } from "./tokenizer";
import { HEADER_FLAG_MAPPINGS, DATA_FLAG_CONTENT_TYPES, COOKIE_FLAGS, TIMEOUT_FLAGS, REDIRECT_FLAGS, SECURITY_FLAGS } from "./constants";



function parseCurlCommand(curlCommand: string): CurlParseResult {
  const dataValues: string[] = [];
  const formDataEntries: Array<[string, string]> = [];
  const tokens = tokenizeFromCurl(curlCommand);


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
        // for cases where method is passed like this -XPUT 
        case /^-X[A-Z]+$/.test(token.value):
          result.method = token.value.substring(2).toUpperCase();
          break;
        case token.value === '-X' || token.value === '--request':
          if (nextToken) {
            result.method = nextToken.value.toUpperCase();
            i++;
          }
          break;
        // for user-agent and other header flags
        case token.value in HEADER_FLAG_MAPPINGS:
          if (nextToken) {
            const headerName = HEADER_FLAG_MAPPINGS[token.value];
            result.headers[headerName] = nextToken.value;
            i++;
          }
          break;

        case token.value === '-H' || token.value === '--header':
          if (nextToken) {
            const headerMatch = nextToken.value.match(/^([^:]+):\s*(.*)$/);
            if (headerMatch) {
              const [, name, value] = headerMatch;
              result.headers[name] = value;
            }
            i++; 
          }
          break;

        // for mapping different kinds of data
        case token.value in DATA_FLAG_CONTENT_TYPES:
          if (nextToken) {
            const defaultContentType = DATA_FLAG_CONTENT_TYPES[token.value];
            // Only set Content-Type if not already set by -H flag
            if (!result.headers['Content-Type']) {
              result.headers['Content-Type'] = defaultContentType;
            }
            
            const contentType = result.headers['Content-Type'];
            if (contentType === 'multipart/form-data') {
              if (!result.multipartFormData) {
                result.multipartFormData = {};
              }
              const match = nextToken.value.match(/^([^=]+)=(.*)$/);
              if (match) {
                const [, key, value] = match;
                result.multipartFormData[key] = value;
              }
            } else {
              dataValues.push(nextToken.value);
              // Only try to parse as form data if content type is url-encoded
              // and the data looks like form data (contains = and no {)
              if (contentType === 'application/x-www-form-urlencoded' && 
                  nextToken.value.includes('=') && 
                  !nextToken.value.startsWith('{')) {
                nextToken.value.split('&').forEach(pair => {
                  const [key, value] = pair.split('=');
                  if (key) {
                    formDataEntries.push([key, value || '']);
                  }
                });
              }
            }
            result.method = result.method === 'GET' ? 'POST' : result.method;
            i++;
          }
          break;

        case token.value === '-u' || token.value === '--user':
          if (nextToken) {
            result.auth = nextToken.value;
            result.headers['Authorization'] = `Basic ${btoa(nextToken.value)}`;
            i++;
          }
          break;

          case token.value in COOKIE_FLAGS:
            if (nextToken) {
              // Parse cookie string into object
              nextToken.value.split(';').forEach(cookie => {
                const [key, value] = cookie.split('=');
                if (key) {
                  if (!result.cookies) {
                    result.cookies = {};
                  }
                  const decodedKey = key.trim();
                  const decodedValue = value ? decodeURIComponent(value.trim()) : '';
                  result.cookies[decodedKey] = decodedValue;
                }
              });
              i++; // Skip the next token
            }
            break;
          case token.value in TIMEOUT_FLAGS:
            if (nextToken) {
              result.timeout = nextToken.value;
              i++;
            }
            break;
          
          case token.value in REDIRECT_FLAGS:
            result.followRedirects = true;
            break;
          
          case token.value in SECURITY_FLAGS:
            result.insecure = true;
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
  if (dataValues.length > 0) {
    result.data = dataValues.join('&');
    
    // Only set formData for url-encoded content type
    if (result.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
      result.formData = formDataEntries.reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
    }
  }

  return result;
}



export { parseCurlCommand };
