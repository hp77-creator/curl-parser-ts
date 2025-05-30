const { parseCurlCommand } = require("../dist")
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

// complex curl command with multiple headers and query parameters
cases.push({
  input: `curl --location --request GET 'https://google.com/api/v1/data-replay/web/api/google?page=0' --header 'accept: */*' --header 'accept-language: en-US,en;q=0.9,en-IN;q=0.8' --header 'authorization: Bearer token123' --header 'priority: u=1, i' --header 'referer: https://data-replay.gg.com/api/v1/dr/web/executions' --header 'sec-ch-ua: "Microsoft Edge";v="135", "Not-A.Brand";v="8", "Chromium";v="135"' --header 'sec-ch-ua-mobile: ?0' --header 'sec-ch-ua-platform: "Windows"' --header 'sec-fetch-dest: empty' --header 'sec-fetch-mode: cors' --header 'sec-fetch-site: same-origin' --header 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0'`,
  output: {
    method: 'GET',
    url: 'https://google.com/api/v1/data-replay/web/api/google',
    headers: {
      'accept': '*/*',
      'accept-language': 'en-US,en;q=0.9,en-IN;q=0.8',
      'authorization': 'Bearer token123',
      'priority': 'u=1, i',
      'referer': 'https://data-replay.gg.com/api/v1/dr/web/executions',
      'sec-ch-ua': '"Microsoft Edge";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0'
    },
    query: {
      'page': '0'
    },
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

cases.push({
  input: `
  curl --location 'https://qa.piramalfinance.com/api/cds/v1/decision' \
--header 'Content-Type: application/json' \
--header 'Authorization: oaXQhEG7Vbs26sMyr71eRNaaarxuQ9mNl4w-kFHcfLqx9HchOJwBh2Eu8Jd8U8RDrD2mXBSoH_WSn7bpU9tlQQ' \
--header 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36' \
--data '{

    "leadId": "XPLBSLIV000030F"

}'
  `,
  output: {
    method: "POST",
    url: "https://qa.piramalfinance.com/api/cds/v1/decision",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': "oaXQhEG7Vbs26sMyr71eRNaaarxuQ9mNl4w-kFHcfLqx9HchOJwBh2Eu8Jd8U8RDrD2mXBSoH_WSn7bpU9tlQQ",
      'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
    },
    query: {},
    data: "{\n\n    \"leadId\": \"XPLBSLIV000030F\"\n\n}",
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
