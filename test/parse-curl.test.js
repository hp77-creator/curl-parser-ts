const { parseCurlCommand } = require("../src")
const assert = require('assert')

btoa = s =>  Buffer.from(s).toString('base64')

const cases = []

cases.push({
  input: 'curl http://api.sloths.com',
  output: {
    method: 'GET',
    url: 'http://api.sloths.com',
    headers: {},
    query: {},
    data: null,
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
})

cases.push({
  input: 'curl -I http://api.sloths.com',
  output: {
    method: 'HEAD',
    url: 'http://api.sloths.com',
    headers: {},
    query: {},
    data: null,
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
})

cases.push({
  input: 'curl -I http://api.sloths.com -vvv --foo --whatever bar',
  output: {
    method: 'HEAD',
    url: 'http://api.sloths.com',
    headers: {},
    query: {},
    data: null,
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
})

cases.push({
  input: 'curl google.com',
  output: {
    method: 'GET',
    url: 'google.com',
    headers: {},
    query: {},
    data: null,
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
})

cases.push({
  input: 'curl -H "Origin: https://example.com" https://example.com',
  output: {
    method: 'GET',
    url: 'https://example.com',
    headers: {
      Origin: "https://example.com"
    },
    query: {},
    data: null,
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
})

cases.push({
  input: 'curl --compressed http://api.sloths.com',
  output: {
    method: 'GET',
    url: 'http://api.sloths.com',
    headers: {
      'Accept-Encoding': 'deflate, gzip'
    },
    query: {},
    data: null,
    auth: null,
    cookies: {},
    timeout: null,
    proxy: null,
    followRedirects: false,
    insecure: false,
    compressed: true,
    formData: null,
    multipartFormData: null
  }
})

cases.push({
  input: 'curl -H "Accept-Encoding: gzip" --compressed http://api.sloths.com',
  output: {
    method: 'GET',
    url: 'http://api.sloths.com',
    headers: {
      'Accept-Encoding': 'gzip'
    },
    query: {},
    data: null,
    auth: null,
    cookies: {},
    timeout: null,
    proxy: null,
    followRedirects: false,
    insecure: false,
    compressed: true,
    formData: null,
    multipartFormData: null
  }
})

cases.push({
  input: 'curl -X DELETE http://api.sloths.com/sloth/4',
  output: {
    method: 'DELETE',
    url: 'http://api.sloths.com/sloth/4',
    headers: {},
    query: {},
    data: null,
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
})

cases.push({
  input: 'curl -XPUT http://api.sloths.com/sloth/4',
  output: {
    method: 'PUT',
    url: 'http://api.sloths.com/sloth/4',
    headers: {},
    query: {},
    data: null,
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
})

cases.push({
  input: 'curl https://api.sloths.com',
  output: {
    method: 'GET',
    url: 'https://api.sloths.com',
    headers: {},
    query: {},
    data: null,
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
})

cases.push({
  input: 'curl -u tobi:ferret https://api.sloths.com',
  output: {
    method: 'GET',
    url: 'https://api.sloths.com',
    headers: {
      Authorization: 'Basic dG9iaTpmZXJyZXQ='
    },
    query: {},
    data: null,
    auth: 'tobi:ferret',
    cookies: {},
    timeout: null,
    proxy: null,
    followRedirects: false,
    insecure: false,
    compressed: false,
    formData: null,
    multipartFormData: null
  }
})

cases.push({
  input: 'curl -d "foo=bar" https://api.sloths.com',
  output: {
    method: 'POST',
    url: 'https://api.sloths.com',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    query: {},
    data: 'foo=bar',
    auth: null,
    cookies: {},
    timeout: null,
    proxy: null,
    followRedirects: false,
    insecure: false,
    compressed: false,
    formData: {
      'foo': 'bar'
    },
    multipartFormData: null
  }
})

cases.push({
  input: 'curl -d "foo=bar" -d bar=baz https://api.sloths.com',
  output: {
    method: 'POST',
    url: 'https://api.sloths.com',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    query: {},
    data: 'foo=bar&bar=baz',
    auth: null,
    cookies: {},
    timeout: null,
    proxy: null,
    followRedirects: false,
    insecure: false,
    compressed: false,
    formData: {
      'foo': 'bar',
      'bar': 'baz'
    },
    multipartFormData: null
  }
})

cases.push({
  input: 'curl -H "Accept: text/plain" --header "User-Agent: slothy" https://api.sloths.com',
  output: {
    method: 'GET',
    url: 'https://api.sloths.com',
    headers: {
      'Accept': 'text/plain',
      'User-Agent': 'slothy'
    },
    query: {},
    data: null,
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
})

cases.push({
  input: "curl -H 'Accept: text/*' --header 'User-Agent: slothy' https://api.sloths.com",
  output: {
    method: 'GET',
    url: 'https://api.sloths.com',
    headers: {
      'Accept': 'text/*',
      'User-Agent': 'slothy'
    },
    query: {},
    data: null,
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
})

cases.push({
  input: "curl -H 'Accept: text/*' -A slothy https://api.sloths.com",
  output: {
    method: 'GET',
    url: 'https://api.sloths.com',
    headers: {
      'Accept': 'text/*',
      'User-Agent': 'slothy'
    },
    query: {},
    data: null,
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
})

cases.push({
  input: "curl -b 'foo=bar' slothy https://api.sloths.com",
  output: {
    method: 'GET',
    url: 'https://api.sloths.com',
    headers: {},
    query: {},
    data: null,
    auth: null,
    cookies: {
      'foo': 'bar'
    },
    timeout: null,
    proxy: null,
    followRedirects: false,
    insecure: false,
    compressed: false,
    formData: null,
    multipartFormData: null
  }
})

cases.push({
  input: "curl --cookie 'foo=bar' slothy https://api.sloths.com",
  output: {
    method: 'GET',
    url: 'https://api.sloths.com',
    headers: {},
    query: {},
    data: null,
    auth: null,
    cookies: {
      'foo': 'bar'
    },
    timeout: null,
    proxy: null,
    followRedirects: false,
    insecure: false,
    compressed: false,
    formData: null,
    multipartFormData: null
  }
})

cases.push({
  input: "curl --cookie 'species=sloth;type=galactic' slothy https://api.sloths.com",
  output: {
    method: 'GET',
    url: 'https://api.sloths.com',
    headers: {},
    query: {},
    data: null,
    auth: null,
    cookies: {
      'species': 'sloth',
      'type': 'galactic'
    },
    timeout: null,
    proxy: null,
    followRedirects: false,
    insecure: false,
    compressed: false,
    formData: null,
    multipartFormData: null
  }
})

// Query parameters testcase
cases.push({
  input: 'curl "https://api.sloths.com/search?type=lazy&age=5"',
  output: {
    method: 'GET',
    url: 'https://api.sloths.com/search',
    headers: {},
    query: {
      'type': 'lazy',
      'age': '5'
    },
    data: null,
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
})

// multiple headers with same name

cases.push({
  input: 'curl -H "Accept: text/html" -H "Accept: application/json" https://api.sloths.com',
  output: {
    method: 'GET',
    url: 'https://api.sloths.com',
    headers: {
      'Accept': 'application/json'  // Last one wins
    },
    query: {},
    data: null,
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
})


// request with timeout
cases.push({
  input: 'curl --connect-timeout 30 https://api.sloths.com',
  output: {
    method: 'GET',
    url: 'https://api.sloths.com',
    headers: {},
    query: {},
    data: null,
    auth: null,
    cookies: {},
    timeout: '30',
    proxy: null,
    followRedirects: false,
    insecure: false,
    compressed: false,
    formData: null,
    multipartFormData: null
  }
})

// with follow-redirects

cases.push({
  input: 'curl -L https://api.sloths.com',
  output: {
    method: 'GET',
    url: 'https://api.sloths.com',
    headers: {},
    query: {},
    data: null,
    auth: null,
    cookies: {},
    timeout: null,
    proxy: null,
    followRedirects: true,
    insecure: false,
    compressed: false,
    formData: null,
    multipartFormData: null
  }
})

// insecure 
cases.push({
  input: 'curl -k https://api.sloths.com',
  output: {
    method: 'GET',
    url: 'https://api.sloths.com',
    headers: {},
    query: {},
    data: null,
    auth: null,
    cookies: {},
    timeout: null,
    proxy: null,
    followRedirects: false,
    insecure: true,
    compressed: false,
    formData: null,
    multipartFormData: null
  }
})

// multiple cookies 
cases.push({
  input: 'curl -b "session=abc123; theme=dark; preferences=font%3DArial" https://api.sloths.com',
  output: {
    method: 'GET',
    url: 'https://api.sloths.com',
    headers: {},
    query: {},
    data: null,
    auth: null,
    cookies: {
      'session': 'abc123',
      'theme': 'dark',
      'preferences': 'font=Arial'
    },
    timeout: null,
    proxy: null,
    followRedirects: false,
    insecure: false,
    compressed: false,
    formData: null,
    multipartFormData: null
  }
})

// multipart-form data
cases.push({
  input: 'curl -F "profile=@photo.jpg" -F "name=Sleepy" https://api.sloths.com/upload',
  output: {
    method: 'POST',
    url: 'https://api.sloths.com/upload',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    query: {},
    data: null,
    auth: null,
    cookies: {},
    timeout: null,
    proxy: null,
    followRedirects: false,
    insecure: false,
    compressed: false,
    formData: null,
    multipartFormData: {
      'profile': '@photo.jpg',
      'name': 'Sleepy'
    }
  }
})

// JSON data
cases.push({
  input: 'curl -X POST -H "Content-Type: application/json" -d \'{"name":"Sleepy","type":"ThreeToed"}\' https://api.sloths.com/sloths',
  output: {
    method: 'POST',
    url: 'https://api.sloths.com/sloths',
    headers: {
      'Content-Type': 'application/json'
    },
    query: {},
    data: '{"name":"Sleepy","type":"ThreeToed"}',
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
})

// mixture of multiple scenarios
cases.push({
  input: 'curl -X POST -H "Accept: application/json" -H "Authorization: Bearer token123" -b "session=abc" -L -k --compressed -d "data=test" "https://api.sloths.com/update?id=123"',
  output: {
    method: 'POST',
    url: 'https://api.sloths.com/update',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer token123',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept-Encoding': 'deflate, gzip'
    },
    query: {
      'id': '123'
    },
    data: 'data=test',
    auth: null,
    cookies: {
      'session': 'abc'
    },
    timeout: null,
    proxy: null,
    followRedirects: true,
    insecure: true,
    compressed: true,
    formData: {
      'data': 'test'
    },
    multipartFormData: null
  }
})




cases.forEach(function(c){
  const out = parseCurlCommand(c.input)

  const msg = `
       input: ${c.input}
    expected: ${JSON.stringify(c.output)}
    received: ${JSON.stringify(out)}
  `

  assert.deepEqual(out, c.output, msg)
})

console.log('\n  :)\n')
