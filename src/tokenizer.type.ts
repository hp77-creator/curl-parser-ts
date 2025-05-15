
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


export {Token, TokenizerState};