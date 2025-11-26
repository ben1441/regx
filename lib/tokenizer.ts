/**
 * Regex Tokenizer
 * Parses a regex string into discrete tokens with human-readable descriptions
 */

import { Token, TokenType, TokenizeResult, Quantifier } from './types';

/**
 * Parses a quantifier from the input string at the given position.
 * Supports: +, *, ?, {N}, {N,}, {N,M}
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
    // Parse {N}, {N,}, or {N,M} quantifiers
    const rangeMatch = input.slice(pos).match(/^\{(\d+),(\d*)\}/);
    if (rangeMatch) {
      const min = parseInt(rangeMatch[1], 10);
      const max = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : undefined;
      return {
        quantifier: { type: 'range', min, max },
        newPos: pos + rangeMatch[0].length,
        raw: rangeMatch[0],
      };
    }
    // Parse exact {N}
    const exactMatch = input.slice(pos).match(/^\{(\d+)\}/);
    if (exactMatch) {
      const count = parseInt(exactMatch[1], 10);
      return {
        quantifier: { type: 'exact', count },
        newPos: pos + exactMatch[0].length,
        raw: exactMatch[0],
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
    case 'range':
      if (quantifier.max === undefined) {
        return `${baseDescription} ${quantifier.min} or more times`;
      }
      return `${baseDescription} ${quantifier.min} to ${quantifier.max} times`;
    case 'plus':
      return `${baseDescription} one or more times`;
    case 'star':
      return `${baseDescription} zero or more times`;
    case 'optional':
      return `${baseDescription} optionally`;
    default:
      return baseDescription;
  }
}

/**
 * Creates a token with optional quantifier
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
 * Parses a character class [...] and returns a human-readable description.
 * @param content - The content inside the brackets (without [ and ])
 * @returns Human-readable description of the character class
 */
function describeCharacterClass(content: string): string {
  // Handle negated classes
  const isNegated = content.startsWith('^');
  const innerContent = isNegated ? content.slice(1) : content;

  // Check for simple well-known classes first
  if (innerContent === 'a-z') return isNegated ? 'Any character except lowercase letters' : 'Any lowercase letter';
  if (innerContent === 'A-Z') return isNegated ? 'Any character except uppercase letters' : 'Any uppercase letter';
  if (innerContent === '0-9') return isNegated ? 'Any character except digits' : 'Any digit (0-9)';

  const prefix = isNegated ? 'Any character except: ' : 'Any of: ';
  const parts: string[] = [];
  let i = 0;

  while (i < innerContent.length) {
    // Check for range like a-z
    if (i + 2 < innerContent.length && innerContent[i + 1] === '-' && innerContent[i + 2] !== ']') {
      const start = innerContent[i];
      const end = innerContent[i + 2];
      
      // Describe common ranges
      if (start === 'a' && end === 'z') {
        parts.push('lowercase letters');
      } else if (start === 'A' && end === 'Z') {
        parts.push('uppercase letters');
      } else if (start === '0' && end === '9') {
        parts.push('digits');
      } else {
        parts.push(`${start}-${end}`);
      }
      i += 3;
    } else {
      // Single character or escaped character
      const char = innerContent[i];
      if (char === '\\' && i + 1 < innerContent.length) {
        parts.push(innerContent[i + 1]);
        i += 2;
      } else {
        // Group consecutive single chars
        parts.push(char);
        i++;
      }
    }
  }

  // Simplify output for common patterns
  if (parts.length === 1) {
    return prefix + parts[0];
  }

  return prefix + parts.join(', ');
}


/**
 * Parses a character class starting at position pos.
 * @param input - The regex string
 * @param pos - Position of the opening [
 * @returns The full character class string and new position, or null if invalid
 */
function parseCharacterClass(input: string, pos: number): { raw: string; content: string; newPos: number } | null {
  if (input[pos] !== '[') return null;

  let i = pos + 1;
  let content = '';

  // Handle negation
  if (i < input.length && input[i] === '^') {
    content += '^';
    i++;
  }

  // Handle ] as first char (literal)
  if (i < input.length && input[i] === ']') {
    content += ']';
    i++;
  }

  // Parse until closing ]
  while (i < input.length) {
    const char = input[i];

    if (char === ']') {
      return {
        raw: input.slice(pos, i + 1),
        content,
        newPos: i + 1,
      };
    }

    if (char === '\\' && i + 1 < input.length) {
      // Escaped character inside class
      content += char + input[i + 1];
      i += 2;
    } else {
      content += char;
      i++;
    }
  }

  // Unclosed character class
  return null;
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
      // Check for start anchor
      if (input[pos] === '^') {
        tokens.push(createToken('ANCHOR_START', '^', 'Starts with'));
        pos++;
        continue;
      }

      // Check for end anchor
      if (input[pos] === '$') {
        tokens.push(createToken('ANCHOR_END', '$', 'Ends with'));
        pos++;
        continue;
      }

      // Check for escape sequences
      if (input[pos] === '\\' && pos + 1 < input.length) {
        const escapeChar = input[pos + 1];
        const escapeSeq = `\\${escapeChar}`;
        pos += 2;

        let tokenType: TokenType = 'LITERAL';
        let description = `Literal: ${escapeChar}`;

        if (escapeChar === 'd') {
          tokenType = 'DIGIT';
          description = 'Any digit (0-9)';
        } else if (escapeChar === 'D') {
          tokenType = 'DIGIT';
          description = 'Any non-digit';
        } else if (escapeChar === 's') {
          tokenType = 'WHITESPACE';
          description = 'Any whitespace character';
        } else if (escapeChar === 'S') {
          tokenType = 'WHITESPACE';
          description = 'Any non-whitespace character';
        } else if (escapeChar === 'w') {
          tokenType = 'CHAR_CLASS';
          description = 'Any word character (a-z, A-Z, 0-9, _)';
        } else if (escapeChar === 'W') {
          tokenType = 'CHAR_CLASS';
          description = 'Any non-word character';
        } else if (escapeChar === 'b') {
          tokenType = 'ANCHOR_START';
          description = 'Word boundary';
        } else if (escapeChar === 'B') {
          tokenType = 'ANCHOR_START';
          description = 'Non-word boundary';
        }

        const quantResult = parseQuantifier(input, pos);
        if (quantResult) {
          tokens.push(createToken(tokenType, escapeSeq + quantResult.raw, description, quantResult.quantifier));
          pos = quantResult.newPos;
        } else {
          tokens.push(createToken(tokenType, escapeSeq, description));
        }
        continue;
      }

      // Check for character classes [...]
      if (input[pos] === '[') {
        const classResult = parseCharacterClass(input, pos);
        if (classResult) {
          pos = classResult.newPos;
          const description = describeCharacterClass(classResult.content);

          const quantResult = parseQuantifier(input, pos);
          if (quantResult) {
            tokens.push(createToken('CHAR_CLASS', classResult.raw + quantResult.raw, description, quantResult.quantifier));
            pos = quantResult.newPos;
          } else {
            tokens.push(createToken('CHAR_CLASS', classResult.raw, description));
          }
          continue;
        }
      }

      // Check for groups (...)
      if (input[pos] === '(') {
        // Find matching closing paren (simplified - doesn't handle nested)
        let depth = 1;
        let end = pos + 1;
        while (end < input.length && depth > 0) {
          if (input[end] === '(' && input[end - 1] !== '\\') depth++;
          if (input[end] === ')' && input[end - 1] !== '\\') depth--;
          end++;
        }

        if (depth === 0) {
          const groupContent = input.slice(pos, end);
          pos = end;

          let description = 'Group';
          if (groupContent.startsWith('(?:')) {
            description = 'Non-capturing group';
          } else if (groupContent.startsWith('(?=')) {
            description = 'Positive lookahead';
          } else if (groupContent.startsWith('(?!')) {
            description = 'Negative lookahead';
          } else if (groupContent.startsWith('(?<=')) {
            description = 'Positive lookbehind';
          } else if (groupContent.startsWith('(?<!')) {
            description = 'Negative lookbehind';
          }

          const quantResult = parseQuantifier(input, pos);
          if (quantResult) {
            tokens.push(createToken('CHAR_CLASS', groupContent + quantResult.raw, description, quantResult.quantifier));
            pos = quantResult.newPos;
          } else {
            tokens.push(createToken('CHAR_CLASS', groupContent, description));
          }
          continue;
        }
      }

      // Check for alternation
      if (input[pos] === '|') {
        tokens.push(createToken('LITERAL', '|', 'Or'));
        pos++;
        continue;
      }

      // Check for dot (any character)
      if (input[pos] === '.') {
        pos++;
        const quantResult = parseQuantifier(input, pos);
        if (quantResult) {
          tokens.push(createToken('CHAR_CLASS', '.' + quantResult.raw, 'Any character', quantResult.quantifier));
          pos = quantResult.newPos;
        } else {
          tokens.push(createToken('CHAR_CLASS', '.', 'Any character'));
        }
        continue;
      }

      // Literal character
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

    return { success: true, tokens };
  } catch (error) {
    return {
      success: false,
      tokens,
      error: error instanceof Error ? error.message : 'Unknown tokenization error',
    };
  }
}
