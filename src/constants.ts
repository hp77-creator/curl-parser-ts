const DATA_FLAG_CONTENT_TYPES: Record<string, string> = {
    '-d': 'application/x-www-form-urlencoded',
    '--data': 'application/x-www-form-urlencoded',
    '--data-raw': 'application/x-www-form-urlencoded',
    '--data-binary': 'application/octet-stream',
    '--data-urlencode': 'application/x-www-form-urlencoded',
    '-F': 'multipart/form-data',
    '--form': 'multipart/form-data'
  };
  
  const HEADER_FLAG_MAPPINGS: Record<string, string> = {
    '-A': 'User-Agent',
    '--user-agent': 'User-Agent',
  };
  
  const COOKIE_FLAGS = {
    '-b': true,
    '--cookie': true
  };
  
  const TIMEOUT_FLAGS = {
    '--connect-timeout': true,
    '-m': true,  // Short form for timeout
  };
  
  const REDIRECT_FLAGS = {
    '-L': true,
    '--location': true,
  };
  
  const SECURITY_FLAGS = {
    '-k': true,
    '--insecure': true,
  };
  

  export {HEADER_FLAG_MAPPINGS, COOKIE_FLAGS, TIMEOUT_FLAGS, REDIRECT_FLAGS, SECURITY_FLAGS, DATA_FLAG_CONTENT_TYPES};