/**
 * Regex Tokenizer
 * Parses a regex string into discrete tokens with human-readable descriptions
 */

import { Token, TokenType, TokenizeResult, Quantifier } from './types';

/** Pattern descriptions for human-readable output */
const PATTERN_DESCRIPTIONS: Record<string, string> = {
  '^': 'Starts with',
  '$': 'Ends with',
  '\\d': 'Any digit (0-9)',
  '\\s': 'Any whitespace character',
  '[a-z]': 'Any lowercase letter',
  '[A-Z]': 'Any uppercase letter',
  '[0-9]': 'Any digit (0-9)',
};

/** Quantifier descriptions */
const QUANTIFIER_DESCRIPTIONS: Record<string, string> = {
  '+': 'one or more times',
  '*': 'zero or more times',
  '?': 'optionally',
};

/**
 * Parses a quantifier from the input string at the given position
 * @param input - The regex string
 * @param pos - Current position in the string
 * @returns Quantifier info and new position, or null if no quantifier
 */
function parseQuantifier(input: string, pos: number): { quantifier: Quantifier; newPos: number; raw: string } | null {
  if (pos >= input.length) return null;

  const char = input[pos];

  if (char === '+') {
    return { quantifier: { type: 'plus' }, newPos: pos + 1, raw: '+' };
  }
  if (char === '*') {
    return { quantifier: { type: 'star' }, newPos: pos + 1, raw: '*' };
  }
  if (char === '?') {
    return { quantifier: { type: 'optional' }, newPos: pos + 1, raw: '?' };
  }
  if (char === '{') {
    // Parse {N} quantifier
    const match = input.slice(pos).match(/^\{(\d+)\}/);
    if (match) {
      const count = parseInt(match[1], 10);
      return {
        quantifier: { type: 'exact', count },
        newPos: pos + match[0].length,
        raw: match[0],
      };
    }
  }

  return null;
}


/**
 * Builds a description string with optional quantifier suffix
 * @param baseDescription - The base pattern description
 * @param quantifier - Optional quantifier to append
 * @returns Complete description string
 */
function buildDescription(baseDescription: string, quantifier?: Quantifier): string {
  if (!quantifier) return baseDescription;

  switch (quantifier.type) {
    case 'exact':
      return `${baseDescription} exactly ${quantifier.count} times`;
    case 'plus':
      return `${baseDescription} ${QUANTIFIER_DESCRIPTIONS['+']}`;
    case 'star':
      return `${baseDescription} ${QUANTIFIER_DESCRIPTIONS['*']}`;
    case 'optional':
      return `${baseDescription} ${QUANTIFIER_DESCRIPTIONS['?']}`;
    default:
      return baseDescription;
  }
}

/**
 * Creates a token with optional quantifier
 * @param type - Token type
 * @param raw - Raw regex substring
 * @param baseDescription - Base description before quantifier
 * @param quantifier - Optional quantifier
 * @returns Token object
 */
function createToken(
  type: TokenType,
  raw: string,
  baseDescription: string,
  quantifier?: Quantifier
): Token {
  const token: Token = {
    type,
    raw,
    description: buildDescription(baseDescription, quantifier),
  };
  if (quantifier) {
    token.quantifier = quantifier;
  }
  return token;
}

/**
 * Tokenizes a regex string into discrete tokens with human-readable descriptions
 * @param input - The regex string to tokenize
 * @returns TokenizeResult with success status and tokens array
 */
export function tokenizeRegex(input: string): TokenizeResult {
  if (!input) {
    return { success: true, tokens: [] };
  }

  const tokens: Token[] = [];
  let pos = 0;

  try {
    while (pos < input.length) {
      let matched = false;

      // Check for start anchor
      if (input[pos] === '^') {
        tokens.push(createToken('ANCHOR_START', '^', PATTERN_DESCRIPTIONS['^']));
        pos++;
        matched = true;
        continue;
      }

      // Check for end anchor
      if (input[pos] === '$') {
        tokens.push(createToken('ANCHOR_END', '$', PATTERN_DESCRIPTIONS['$']));
        pos++;
        matched = true;
        continue;
      }

      // Check for escape sequences (\d, \s)
      if (input[pos] === '\\' && pos + 1 < input.length) {
        const escapeChar = input[pos + 1];
        const escapeSeq = `\\${escapeChar}`;

        if (escapeChar === 'd') {
          pos += 2;
          const quantResult = parseQuantifier(input, pos);
          if (quantResult) {
            tokens.push(createToken('DIGIT', escapeSeq + quantResult.raw, PATTERN_DESCRIPTIONS['\\d'], quantResult.quantifier));
            pos = quantResult.newPos;
          } else {
            tokens.push(createToken('DIGIT', escapeSeq, PATTERN_DESCRIPTIONS['\\d']));
          }
          matched = true;
          continue;
        }

        if (escapeChar === 's') {
          pos += 2;
          const quantResult = parseQuantifier(input, pos);
          if (quantResult) {
            tokens.push(createToken('WHITESPACE', escapeSeq + quantResult.raw, PATTERN_DESCRIPTIONS['\\s'], quantResult.quantifier));
            pos = quantResult.newPos;
          } else {
            tokens.push(createToken('WHITESPACE', escapeSeq, PATTERN_DESCRIPTIONS['\\s']));
          }
          matched = true;
          continue;
        }

        // Escaped literal character
        pos += 2;
        const quantResult = parseQuantifier(input, pos);
        if (quantResult) {
          tokens.push(createToken('LITERAL', escapeSeq + quantResult.raw, `Literal: ${escapeChar}`, quantResult.quantifier));
          pos = quantResult.newPos;
        } else {
          tokens.push(createToken('LITERAL', escapeSeq, `Literal: ${escapeChar}`));
        }
        matched = true;
        continue;
      }

      // Check for character classes [a-z], [A-Z], [0-9]
      if (input[pos] === '[') {
        const charClassPatterns = ['[a-z]', '[A-Z]', '[0-9]'];
        for (const pattern of charClassPatterns) {
          if (input.slice(pos, pos + pattern.length) === pattern) {
            pos += pattern.length;
            const quantResult = parseQuantifier(input, pos);
            if (quantResult) {
              tokens.push(createToken('CHAR_CLASS', pattern + quantResult.raw, PATTERN_DESCRIPTIONS[pattern], quantResult.quantifier));
              pos = quantResult.newPos;
            } else {
              tokens.push(createToken('CHAR_CLASS', pattern, PATTERN_DESCRIPTIONS[pattern]));
            }
            matched = true;
            break;
          }
        }
        if (matched) continue;

        // Unknown character class - treat as literal
        tokens.push(createToken('LITERAL', '[', 'Literal: ['));
        pos++;
        matched = true;
        continue;
      }

      // Literal character (unrecognized pattern)
      if (!matched) {
        const char = input[pos];
        pos++;
        const quantResult = parseQuantifier(input, pos);
        if (quantResult) {
          tokens.push(createToken('LITERAL', char + quantResult.raw, `Literal: ${char}`, quantResult.quantifier));
          pos = quantResult.newPos;
        } else {
          tokens.push(createToken('LITERAL', char, `Literal: ${char}`));
        }
      }
    }

    return { success: true, tokens };
  } catch (error) {
    return {
      success: false,
      tokens,
      error: error instanceof Error ? error.message : 'Unknown tokenization error',
    };
  }
}
