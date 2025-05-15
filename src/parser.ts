import { CurlParseResult } from "./types";
import { tokenizeFromCurl } from "./tokenizer";
import { HEADER_FLAG_MAPPINGS, DATA_FLAG_CONTENT_TYPES, COOKIE_FLAGS, TIMEOUT_FLAGS, REDIRECT_FLAGS, SECURITY_FLAGS } from "./constants";

// Precompile regular expressions for better performance
const URL_HTTP_REGEX = /^https?:\/\//;
const URL_DOMAIN_REGEX = /^[^.]+\.[^.]+/;
const HEADER_REGEX = /^([^:]+):\s*(.*)$/;
const FORM_DATA_REGEX = /^([^=]+)=(.*)$/;
const METHOD_REGEX = /^-X([A-Z]+)$/;

// Common string constants to reduce allocations
const GET = 'GET';
const POST = 'POST';
const HEAD = 'HEAD';
const CONTENT_TYPE = 'Content-Type';
const ACCEPT_ENCODING = 'Accept-Encoding';
const AUTHORIZATION = 'Authorization';
const DEFLATE_GZIP = 'deflate, gzip';
const BASIC_PREFIX = 'Basic ';
const EMPTY_STRING = '';

/**
 * Parse a curl command string into a structured object
 */
function parseCurlCommand(curlCommand: string): CurlParseResult {
  if (!curlCommand) {
    return createEmptyResult();
  }

  const tokens = tokenizeFromCurl(curlCommand);
  if (!tokens.length) {
    return createEmptyResult();
  }

  const result: CurlParseResult = {
    url: EMPTY_STRING,
    method: GET,
    headers: Object.create(null), // Faster than {}
    query: Object.create(null),
    data: null,
    auth: null,
    cookies: Object.create(null),
    timeout: null,
    proxy: null,
    followRedirects: false,
    insecure: false,
    compressed: false,
    formData: null,
    multipartFormData: null,
  };

  let dataValues: string[] | null = null;
  let formDataEntries: [string, string][] | null = null;
  let urlFound = false;

  for (let i = tokens.length - 1; i >= 0; i--) {
    const token = tokens[i];
    if (token.type === 'URL' || (token.type === 'ARGUMENT' && (
      URL_HTTP_REGEX.test(token.value) || URL_DOMAIN_REGEX.test(token.value)
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
      const tokenValue = token.value;
      
      if (tokenValue === '-I') {
        result.method = HEAD;
      }
      else if (tokenValue === '--compressed') {
        result.compressed = true;
        if (!result.headers[ACCEPT_ENCODING]) {
          result.headers[ACCEPT_ENCODING] = DEFLATE_GZIP;
        }
      }
      else if (METHOD_REGEX.test(tokenValue)) {
        result.method = tokenValue.substring(2).toUpperCase();
      }
      else if (tokenValue === '-X' || tokenValue === '--request') {
        if (nextToken) {
          result.method = nextToken.value.toUpperCase();
          i++;
        }
      }
      else if (tokenValue in HEADER_FLAG_MAPPINGS) {
        if (nextToken) {
          const headerName = HEADER_FLAG_MAPPINGS[tokenValue];
          result.headers[headerName] = nextToken.value;
          i++;
        }
      }
      else if (tokenValue === '-H' || tokenValue === '--header') {
        if (nextToken) {
          const headerMatch = HEADER_REGEX.exec(nextToken.value);
          if (headerMatch) {
            const name = headerMatch[1];
            const value = headerMatch[2];
            result.headers[name] = value;
          }
          i++;
        }
      }
      else if (tokenValue in DATA_FLAG_CONTENT_TYPES) {
        if (nextToken) {
          const defaultContentType = DATA_FLAG_CONTENT_TYPES[tokenValue];
          // Only set Content-Type if not already set by -H flag
          if (!result.headers[CONTENT_TYPE]) {
            result.headers[CONTENT_TYPE] = defaultContentType;
          }
          
          const contentType = result.headers[CONTENT_TYPE];
          
          if (contentType === 'multipart/form-data') {
            if (!result.multipartFormData) {
              result.multipartFormData = Object.create(null) as Record<string, string>;
            }
            const match = FORM_DATA_REGEX.exec(nextToken.value);
            if (match) {
              const key = match[1];
              const value = match[2];
              result.multipartFormData[key] = value;
            }
          } else {
            if (!dataValues) {
              dataValues = [];
            }
            
            dataValues.push(nextToken.value);
            
            // Only try to parse as form data if content type is url-encoded
            // and the data looks like form data (contains = and no {)
            if (contentType === 'application/x-www-form-urlencoded' && 
                nextToken.value.includes('=') && 
                !nextToken.value.startsWith('{')) {
              
              if (!formDataEntries) {
                formDataEntries = [];
              }
              
              const pairs = nextToken.value.split('&');
              for (let j = 0; j < pairs.length; j++) {
                const pair = pairs[j];
                const eqIndex = pair.indexOf('=');
                if (eqIndex !== -1) {
                  const key = pair.substring(0, eqIndex);
                  const value = eqIndex + 1 < pair.length ? pair.substring(eqIndex + 1) : EMPTY_STRING;
                  if (key) {
                    formDataEntries.push([key, value]);
                  }
                }
              }
            }
          }
          
          // Set method to POST if it's currently GET
          if (result.method === GET) {
            result.method = POST;
          }
          
          i++;
        }
      }
      else if (tokenValue === '-u' || tokenValue === '--user') {
        if (nextToken) {
          result.auth = nextToken.value;
          result.headers[AUTHORIZATION] = BASIC_PREFIX + btoa(nextToken.value);
          i++;
        }
      }
      else if (tokenValue in COOKIE_FLAGS) {
        if (nextToken) {
          const cookies = nextToken.value.split(';');
          for (let j = 0; j < cookies.length; j++) {
            const cookie = cookies[j];
            const eqIndex = cookie.indexOf('=');
            if (eqIndex !== -1) {
              const key = cookie.substring(0, eqIndex).trim();
              if (key) {
                const value = eqIndex + 1 < cookie.length ? 
                  decodeURIComponent(cookie.substring(eqIndex + 1).trim()) : EMPTY_STRING;
                result.cookies[key] = value;
              }
            }
          }
          i++;
        }
      }
      else if (tokenValue in TIMEOUT_FLAGS) {
        if (nextToken) {
          result.timeout = nextToken.value;
          i++;
        }
      }
      else if (tokenValue in REDIRECT_FLAGS) {
        result.followRedirects = true;
      }
      else if (tokenValue in SECURITY_FLAGS) {
        result.insecure = true;
      }
    }
  }

  const queryIndex = result.url.indexOf('?');
  if (queryIndex !== -1) {
    const queryString = result.url.substring(queryIndex + 1);
    result.url = result.url.substring(0, queryIndex);
    
    const pairs = queryString.split('&');
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      const eqIndex = pair.indexOf('=');
      if (eqIndex !== -1) {
        const key = pair.substring(0, eqIndex);
        if (key) {
          try {
            const decodedKey = decodeURIComponent(key);
            const value = eqIndex + 1 < pair.length ? 
              decodeURIComponent(pair.substring(eqIndex + 1)) : EMPTY_STRING;
            result.query[decodedKey] = value;
          } catch (e) {
            result.query[key] = eqIndex + 1 < pair.length ? 
              pair.substring(eqIndex + 1) : EMPTY_STRING;
          }
        }
      }
    }
  }

  if (dataValues && dataValues.length > 0) {
    result.data = dataValues.join('&');
    
    if (formDataEntries && formDataEntries.length > 0 && 
        result.headers[CONTENT_TYPE] === 'application/x-www-form-urlencoded') {
      result.formData = Object.create(null) as Record<string, string>;
      for (let i = 0; i < formDataEntries.length; i++) {
        const [key, value] = formDataEntries[i];
        result.formData[key] = value;
      }
    }
  }

  return result;
}

/**
 * Create an empty result object
 */
function createEmptyResult(): CurlParseResult {
  return {
    url: EMPTY_STRING,
    method: GET,
    headers: Object.create(null),
    query: Object.create(null),
    data: null,
    auth: null,
    cookies: Object.create(null),
    timeout: null,
    proxy: null,
    followRedirects: false,
    insecure: false,
    compressed: false,
    formData: null,
    multipartFormData: null,
  };
}

export { parseCurlCommand };
