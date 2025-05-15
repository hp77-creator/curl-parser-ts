// ESM wrapper for curl-parser-ts
// This file provides an ESM entry point for the package

import { tokenizeFromCurl } from './tokenizer';
import { parseCurlCommand } from './parser';
import type { CurlParseResult, Token, TokenizerState } from './types';

export { tokenizeFromCurl, parseCurlCommand };
export type { CurlParseResult, Token, TokenizerState };

// Default export for easier importing
export default {
  parseCurlCommand,
  tokenizeFromCurl
};
