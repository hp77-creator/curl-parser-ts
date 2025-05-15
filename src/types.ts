interface CurlParseResult {
    url: string,
    method: string,
    headers: Record<string, string>,
    query: Record<string, string>,
    data: string | null,
    auth: string | null,
    cookies: Record<string, string>,
    timeout: string | null,
    proxy: string | null,
    followRedirects: boolean,
    insecure: boolean,
    compressed: boolean,
    formData: Record<string, string> | null,
    multipartFormData: Record<string, string> | null,
}


interface Token {
    type: 'OPTION' | 'ARGUMENT' | 'URL';
    value: string;
    raw: string;
}

type TokenizerState = 
    | 'INITIAL'
    | 'OPTION'
    | 'ARGUMENT' 
    | 'QUOTE_SINGLE'
    | 'QUOTE_DOUBLE' 
    | 'ESCAPE';


export {Token, TokenizerState, CurlParseResult};
