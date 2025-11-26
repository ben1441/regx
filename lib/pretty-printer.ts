/**
 * Pretty Printer
 * Reconstructs a regex string from an array of tokens
 */

import { Token } from './types';

/**
 * Reconstructs a regex string from an array of tokens
 * @param tokens - Array of tokens to convert back to regex
 * @returns The reconstructed regex string
 */
export function tokensToRegex(tokens: Token[]): string {
  if (!tokens || tokens.length === 0) {
    return '';
  }

  return tokens.map((token) => token.raw).join('');
}
