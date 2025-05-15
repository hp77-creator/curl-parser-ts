import { Token, TokenizerState } from "./types";

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
                    const remaining = command.substring(i);
                    const urlMatch = remaining.match(/^(https?:\/\/[^\s]+)/);
                    
                    if (urlMatch) {
                        // Found a URL, consume it entirely and push immediately
                        tokens.push({
                            type: 'URL',
                            value: urlMatch[1],
                            raw: urlMatch[1]
                        });
                        i += urlMatch[1].length - 1; // -1 because loop will increment i
                        state = 'INITIAL';
                        // Clear any current token data since we've pushed directly
                        currentToken = '';
                        currentTokenRaw = '';
                        currentType = null;
                    } else {
                        // Not a URL, treat as regular argument
                        currentType = 'ARGUMENT';
                        currentToken = char;
                        currentTokenRaw = char;
                        state = 'ARGUMENT';
                    }
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
                    if (char === ' ' || char === '\t' || char === '\n') {
                        // End of argument
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

export {tokenizeFromCurl};