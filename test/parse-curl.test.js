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
