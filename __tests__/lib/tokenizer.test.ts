/**
 * Property-based tests for the Regex Tokenizer and Pretty-Printer
 * Uses fast-check for property testing
 * 
 * **Feature: regx-visual-builder**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { tokenizeRegex } from '../../lib/tokenizer';
import { tokensToRegex } from '../../lib/pretty-printer';

// ============================================================================
// Arbitrary generators for regex patterns
// ============================================================================

/** Generate anchor patterns */
const arbAnchorStart = fc.constant('^');
const arbAnchorEnd = fc.constant('$');

/** Generate escape sequences */
const arbDigitPattern = fc.constant('\\d');
const arbWhitespacePattern = fc.constant('\\s');

/** Generate character classes */
const arbLowercaseClass = fc.constant('[a-z]');
const arbUppercaseClass = fc.constant('[A-Z]');
const arbDigitClass = fc.constant('[0-9]');

/** Generate quantifiers */
const arbExactQuantifier = fc.integer({ min: 1, max: 99 }).map((n) => `{${n}}`);
const arbPlusQuantifier = fc.constant('+');
const arbStarQuantifier = fc.constant('*');
const arbOptionalQuantifier = fc.constant('?');

const arbQuantifier = fc.oneof(
  arbExactQuantifier,
  arbPlusQuantifier,
  arbStarQuantifier,
  arbOptionalQuantifier
);

/** Generate literal characters (excluding special regex chars) */
const arbLiteralChar = fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'.split(''));

/** Generate a quantifiable pattern (can have quantifier attached) */
const arbQuantifiablePattern = fc.oneof(
  arbDigitPattern,
  arbWhitespacePattern,
  arbLowercaseClass,
  arbUppercaseClass,
  arbDigitClass,
  arbLiteralChar
);

/** Generate a pattern with optional quantifier */
const arbPatternWithOptionalQuantifier = fc.tuple(
  arbQuantifiablePattern,
  fc.option(arbQuantifier, { nil: undefined })
).map(([pattern, quant]) => pattern + (quant ?? ''));

/** Generate a complete valid regex string from supported patterns */
const arbValidRegex = fc.tuple(
  fc.option(arbAnchorStart, { nil: undefined }),
  fc.array(arbPatternWithOptionalQuantifier, { minLength: 0, maxLength: 5 }),
  fc.option(arbAnchorEnd, { nil: undefined })
).map(([start, patterns, end]) => {
  return (start ?? '') + patterns.join('') + (end ?? '');
});


// ============================================================================
// Property Tests
// ============================================================================

describe('Regex Tokenizer and Pretty-Printer', () => {
  /**
   * **Feature: regx-visual-builder, Property 4: Tokenizer-PrettyPrinter round-trip**
   * 
   * For any valid regex string composed of supported patterns, tokenizing the string
   * and then pretty-printing the tokens SHALL produce a regex string that is
   * semantically equivalent to the original.
   * 
   * **Validates: Requirements 3.15**
   */
  it('Property 4: Tokenizer-PrettyPrinter round-trip', () => {
    fc.assert(
      fc.property(arbValidRegex, (regex) => {
        const tokenResult = tokenizeRegex(regex);
        
        // Tokenization should succeed
        expect(tokenResult.success).toBe(true);
        
        // Pretty-printing should reconstruct the original regex
        const reconstructed = tokensToRegex(tokenResult.tokens);
        expect(reconstructed).toBe(regex);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: regx-visual-builder, Property 5: Tokenizer description mapping**
   * 
   * For any regex string containing supported patterns (^, $, \d, \s, [a-z], [A-Z], [0-9]),
   * the tokenizer SHALL produce tokens with descriptions that correctly identify the pattern type.
   * 
   * **Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8**
   */
  it('Property 5: Tokenizer description mapping', () => {
    // Test anchor start
    fc.assert(
      fc.property(fc.constant('^'), (pattern) => {
        const result = tokenizeRegex(pattern);
        expect(result.success).toBe(true);
        expect(result.tokens.length).toBe(1);
        expect(result.tokens[0].description).toBe('Starts with');
        expect(result.tokens[0].type).toBe('ANCHOR_START');
      }),
      { numRuns: 100 }
    );

    // Test anchor end
    fc.assert(
      fc.property(fc.constant('$'), (pattern) => {
        const result = tokenizeRegex(pattern);
        expect(result.success).toBe(true);
        expect(result.tokens.length).toBe(1);
        expect(result.tokens[0].description).toBe('Ends with');
        expect(result.tokens[0].type).toBe('ANCHOR_END');
      }),
      { numRuns: 100 }
    );

    // Test digit pattern
    fc.assert(
      fc.property(fc.constant('\\d'), (pattern) => {
        const result = tokenizeRegex(pattern);
        expect(result.success).toBe(true);
        expect(result.tokens.length).toBe(1);
        expect(result.tokens[0].description).toBe('Any digit (0-9)');
        expect(result.tokens[0].type).toBe('DIGIT');
      }),
      { numRuns: 100 }
    );

    // Test whitespace pattern
    fc.assert(
      fc.property(fc.constant('\\s'), (pattern) => {
        const result = tokenizeRegex(pattern);
        expect(result.success).toBe(true);
        expect(result.tokens.length).toBe(1);
        expect(result.tokens[0].description).toBe('Any whitespace character');
        expect(result.tokens[0].type).toBe('WHITESPACE');
      }),
      { numRuns: 100 }
    );

    // Test lowercase character class
    fc.assert(
      fc.property(fc.constant('[a-z]'), (pattern) => {
        const result = tokenizeRegex(pattern);
        expect(result.success).toBe(true);
        expect(result.tokens.length).toBe(1);
        expect(result.tokens[0].description).toBe('Any lowercase letter');
        expect(result.tokens[0].type).toBe('CHAR_CLASS');
      }),
      { numRuns: 100 }
    );

    // Test uppercase character class
    fc.assert(
      fc.property(fc.constant('[A-Z]'), (pattern) => {
        const result = tokenizeRegex(pattern);
        expect(result.success).toBe(true);
        expect(result.tokens.length).toBe(1);
        expect(result.tokens[0].description).toBe('Any uppercase letter');
        expect(result.tokens[0].type).toBe('CHAR_CLASS');
      }),
      { numRuns: 100 }
    );

    // Test digit character class [0-9]
    fc.assert(
      fc.property(fc.constant('[0-9]'), (pattern) => {
        const result = tokenizeRegex(pattern);
        expect(result.success).toBe(true);
        expect(result.tokens.length).toBe(1);
        expect(result.tokens[0].description).toBe('Any digit (0-9)');
        expect(result.tokens[0].type).toBe('CHAR_CLASS');
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: regx-visual-builder, Property 6: Tokenizer quantifier handling**
   * 
   * For any regex pattern followed by a quantifier ({N}, +, *, ?), the tokenizer
   * SHALL append the appropriate quantifier description to the preceding token.
   * 
   * **Validates: Requirements 3.9, 3.10, 3.11, 3.12**
   */
  it('Property 6: Tokenizer quantifier handling', () => {
    // Test exact quantifier {N}
    fc.assert(
      fc.property(
        fc.tuple(arbQuantifiablePattern, fc.integer({ min: 1, max: 99 })),
        ([pattern, count]) => {
          const regex = `${pattern}{${count}}`;
          const result = tokenizeRegex(regex);
          
          expect(result.success).toBe(true);
          expect(result.tokens.length).toBe(1);
          expect(result.tokens[0].quantifier).toBeDefined();
          expect(result.tokens[0].quantifier?.type).toBe('exact');
          expect(result.tokens[0].quantifier?.count).toBe(count);
          expect(result.tokens[0].description).toContain(`exactly ${count} times`);
        }
      ),
      { numRuns: 100 }
    );

    // Test plus quantifier +
    fc.assert(
      fc.property(arbQuantifiablePattern, (pattern) => {
        const regex = `${pattern}+`;
        const result = tokenizeRegex(regex);
        
        expect(result.success).toBe(true);
        expect(result.tokens.length).toBe(1);
        expect(result.tokens[0].quantifier).toBeDefined();
        expect(result.tokens[0].quantifier?.type).toBe('plus');
        expect(result.tokens[0].description).toContain('one or more times');
      }),
      { numRuns: 100 }
    );

    // Test star quantifier *
    fc.assert(
      fc.property(arbQuantifiablePattern, (pattern) => {
        const regex = `${pattern}*`;
        const result = tokenizeRegex(regex);
        
        expect(result.success).toBe(true);
        expect(result.tokens.length).toBe(1);
        expect(result.tokens[0].quantifier).toBeDefined();
        expect(result.tokens[0].quantifier?.type).toBe('star');
        expect(result.tokens[0].description).toContain('zero or more times');
      }),
      { numRuns: 100 }
    );

    // Test optional quantifier ?
    fc.assert(
      fc.property(arbQuantifiablePattern, (pattern) => {
        const regex = `${pattern}?`;
        const result = tokenizeRegex(regex);
        
        expect(result.success).toBe(true);
        expect(result.tokens.length).toBe(1);
        expect(result.tokens[0].quantifier).toBeDefined();
        expect(result.tokens[0].quantifier?.type).toBe('optional');
        expect(result.tokens[0].description).toContain('optionally');
      }),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Unit Tests for Edge Cases
// ============================================================================

describe('Tokenizer edge cases', () => {
  it('should return empty tokens for empty input', () => {
    const result = tokenizeRegex('');
    expect(result.success).toBe(true);
    expect(result.tokens).toEqual([]);
  });

  it('should handle unrecognized patterns as literals', () => {
    const result = tokenizeRegex('abc');
    expect(result.success).toBe(true);
    expect(result.tokens.length).toBe(3);
    expect(result.tokens[0].description).toBe('Literal: a');
    expect(result.tokens[1].description).toBe('Literal: b');
    expect(result.tokens[2].description).toBe('Literal: c');
  });

  it('should handle escaped characters as literals', () => {
    const result = tokenizeRegex('\\.');
    expect(result.success).toBe(true);
    expect(result.tokens.length).toBe(1);
    expect(result.tokens[0].description).toBe('Literal: .');
  });

  it('should handle complex regex patterns', () => {
    const result = tokenizeRegex('^\\d{3}[a-z]+$');
    expect(result.success).toBe(true);
    expect(result.tokens.length).toBe(4);
    expect(result.tokens[0].type).toBe('ANCHOR_START');
    expect(result.tokens[1].type).toBe('DIGIT');
    expect(result.tokens[1].quantifier?.count).toBe(3);
    expect(result.tokens[2].type).toBe('CHAR_CLASS');
    expect(result.tokens[2].quantifier?.type).toBe('plus');
    expect(result.tokens[3].type).toBe('ANCHOR_END');
  });
});

describe('Pretty-printer edge cases', () => {
  it('should return empty string for empty token array', () => {
    expect(tokensToRegex([])).toBe('');
  });

  it('should handle null/undefined gracefully', () => {
    expect(tokensToRegex(null as unknown as [])).toBe('');
    expect(tokensToRegex(undefined as unknown as [])).toBe('');
  });
});
