import { Token, TokenizerState } from "./tokenizer.type.ts";

function tokenizeFromCurl(curlCommand: string): Token[] {
    const command = curlCommand.trim().replace(/^\s*curl\s+/, '');

    const tokens: Token[] = [];
    let currentToken = '';
    let currentTokenRaw = '';
    let currentType: Token['type'] | null = null;
    let state: TokenizerState = 'INITIAL';

    let i = 0;

    while (i < command.length) {
        const char = command[i];
        const nextChar = command[i+1] || '';

        switch (state) {
            case 'INITIAL':
                if (char == ' ' || char == '\t' || char == '\n') {
                    i++;
                    continue;
                } else if (char == '-') {
                    currentType = 'OPTION';
                    currentToken = char;
                    currentTokenRaw = char;
                    state = 'OPTION';
                } else if (char == "'" || char == '"') {
                    currentToken = '';
                    currentTokenRaw = char;
                    currentType = 'ARGUMENT';
                    state = char === "'" ? 'QUOTE_SINGLE' : 'QUOTE_DOUBLE';
                } else {
                    currentType = command.substring(i).match(/^https?:\/\//) ? 'URL' : 'ARGUMENT';
                    currentToken = char;
                    currentTokenRaw = char;
                    state = 'ARGUMENT';
                }
                break;
            
            case 'OPTION':
                if (char === ' ' || char === '\t' || char === '\n') {
                    // End of option
                    tokens.push({ type: currentType!, value: currentToken, raw: currentTokenRaw });
                    currentToken = '';
                    currentTokenRaw = '';
                    currentType = null;
                    state = 'INITIAL';
                } else {
                    // Continue option
                    currentToken += char;
                    currentTokenRaw += char;
                }
                break;
            
            case 'ARGUMENT':
                if ((char === ' ' || char === '\t' || char === '\n') && 
                    !(currentType === 'URL' && currentToken.indexOf(' ') === -1)) {
                    // End of argument (special handling for URLs)
                    tokens.push({ type: currentType!, value: currentToken, raw: currentTokenRaw });
                    currentToken = '';
                    currentTokenRaw = '';
                    currentType = null;
                    state = 'INITIAL';
                } else {
                    // Continue argument
                    currentToken += char;
                    currentTokenRaw += char;
                }
                break;
            case 'QUOTE_SINGLE':
                if (char === "'") {
                    // End of single quoted string
                    currentTokenRaw += char;
                    tokens.push({ type: currentType!, value: currentToken, raw: currentTokenRaw });
                    currentToken = '';
                    currentTokenRaw = '';
                    currentType = null;
                    state = 'INITIAL';
                } else if (char === '\\' && (nextChar === "'" || nextChar === '\\')) {
                    // Escape sequence
                    currentTokenRaw += char;
                    state = 'ESCAPE';
                } else {
                    // Continue quoted string
                    currentToken += char;
                    currentTokenRaw += char;
                }
                break;
            case 'QUOTE_DOUBLE':
                if (char === '"') {
                    // End of double quoted string
                    currentTokenRaw += char;
                    tokens.push({ type: currentType!, value: currentToken, raw: currentTokenRaw });
                    currentToken = '';
                    currentTokenRaw = '';
                    currentType = null;
                    state = 'INITIAL';
                } else if (char === '\\' && (nextChar === '"' || nextChar === '\\' || nextChar === '$')) {
                    // Escape sequence
                    currentTokenRaw += char;
                    state = 'ESCAPE';
                } else {
                    // Continue quoted string
                    currentToken += char;
                    currentTokenRaw += char;
                }
                break;
            
            case 'ESCAPE':
                // Add the escaped character
                currentToken += char;
                currentTokenRaw += char;
                state = currentType === 'ARGUMENT' ? 'ARGUMENT' : 
                        (currentTokenRaw[0] === "'" ? 'QUOTE_SINGLE' : 'QUOTE_DOUBLE');
                break;

        }
        i++;
    }

    if (currentToken) {
        tokens.push({ type: currentType!, value: currentToken, raw: currentTokenRaw });
      }

    return tokens;
}