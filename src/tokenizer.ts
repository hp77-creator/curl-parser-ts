import { Token, TokenizerState } from "./types";

// Precompile regex for URL detection for better performance
const URL_REGEX = /^(https?:\/\/[^\s]+)/;

function tokenizeFromCurl(curlCommand: string): Token[] {
    if (!curlCommand) return [];
    
    let startIndex = 0;
    const len = curlCommand.length;
    
    // Skip leading whitespace
    while (startIndex < len && (curlCommand[startIndex] === ' ' || curlCommand[startIndex] === '\t' || curlCommand[startIndex] === '\n')) {
        startIndex++;
    }
    
    // Skip "curl" prefix if present
    if (startIndex + 4 <= len && curlCommand.substring(startIndex, startIndex + 4).toLowerCase() === 'curl') {
        startIndex += 4;
        // Skip whitespace after "curl"
        while (startIndex < len && (curlCommand[startIndex] === ' ' || curlCommand[startIndex] === '\t' || curlCommand[startIndex] === '\n')) {
            startIndex++;
        }
    }
    
    const tokens: Token[] = [];
    let currentToken = '';
    let currentTokenRaw = '';
    let currentType: Token['type'] | null = null;
    let state: TokenizerState = 'INITIAL';
    
    let i = startIndex;

    while (i < len) {
        const char = curlCommand[i];
        const nextChar = i + 1 < len ? curlCommand[i + 1] : '';

        switch (state) {
            case 'INITIAL':
                if (char === ' ' || char === '\t' || char === '\n') {
                    i++;
                    continue;
                } else if (char === '-') {
                    currentType = 'OPTION';
                    currentToken = char;
                    currentTokenRaw = char;
                    state = 'OPTION';
                } else if (char === "'" || char === '"') {
                    currentToken = '';
                    currentTokenRaw = char;
                    currentType = 'ARGUMENT';
                    state = char === "'" ? 'QUOTE_SINGLE' : 'QUOTE_DOUBLE';
                } else {
                    // Check for URL pattern
                    const remaining = curlCommand.substring(i);
                    const urlMatch = URL_REGEX.exec(remaining);
                    
                    if (urlMatch) {
                        // Found a URL, consume it entirely and push immediately
                        const url = urlMatch[1];
                        tokens.push({
                            type: 'URL',
                            value: url,
                            raw: url
                        });
                        i += url.length - 1; // -1 because loop will increment i
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

    // Add any remaining token
    if (currentToken) {
        tokens.push({ type: currentType!, value: currentToken, raw: currentTokenRaw });
    }

    return tokens;
}

export {tokenizeFromCurl};
