/**
 * Property-based tests for the Pattern Matcher
 * Uses fast-check for property testing
 * 
 * **Feature: regx-visual-builder**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { findMatches } from '../../lib/matcher';

// ============================================================================
// Arbitrary generators for regex patterns and test strings
// ============================================================================

/** Generate simple valid regex patterns */
const arbLiteralPattern = fc
  .array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 1, maxLength: 5 })
  .map((chars) => chars.join(''));

const arbSimplePattern = fc.oneof(
  fc.constant('\\d+'),
  fc.constant('\\s+'),
  fc.constant('[a-z]+'),
  fc.constant('[A-Z]+'),
  fc.constant('[0-9]+'),
  fc.constant('\\w+'),
  arbLiteralPattern
);

/** Generate test strings that may contain matches */
const arbTestString = fc.string({ minLength: 0, maxLength: 100 });

/** Generate alphanumeric test strings (more likely to have matches) */
const alphanumericChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ';
const arbAlphanumericString = fc
  .array(fc.constantFrom(...alphanumericChars.split('')), { minLength: 1, maxLength: 50 })
  .map((chars) => chars.join(''));

/** Generate invalid regex patterns that JavaScript's RegExp rejects */
const arbInvalidPattern = fc.constantFrom(
  '[',           // Unclosed character class
  '(',           // Unclosed group
  '*',           // Nothing to repeat
  '+',           // Nothing to repeat
  '?',           // Nothing to repeat
  '\\',          // Trailing backslash
  '[a-',         // Incomplete range
  '(?P<',        // Invalid group syntax
  '(?<name',     // Unclosed named group
  '(?>',         // Atomic group (not supported in JS)
  '(?=',         // Unclosed lookahead
  '(?!',         // Unclosed negative lookahead
  '[z-a]'        // Invalid range (z > a)
);

// ============================================================================
// Property Tests
// ============================================================================

describe('Pattern Matcher', () => {
  /**
   * **Feature: regx-visual-builder, Property 7: Matcher correctness**
   * 
   * For any valid regex pattern and test string, the matcher SHALL return match
   * results that are identical to those produced by JavaScript's native
   * String.matchAll() method.
   * 
   * **Validates: Requirements 4.1, 4.2**
   */
  it('Property 7: Matcher correctness', () => {
    fc.assert(
      fc.property(
        arbSimplePattern,
        arbAlphanumericString,
        (pattern: string, text: string) => {
          const result = findMatches(pattern, text);
          
          // Should succeed for valid patterns
          expect(result.success).toBe(true);
          expect(result.error).toBeUndefined();
          
          // Compare with native matchAll
          const regex = new RegExp(pattern, 'g');
          const nativeMatches = [...text.matchAll(regex)];
          
          // Same number of matches
          expect(result.matches.length).toBe(nativeMatches.length);
          
          // Each match should have correct text and positions
          for (let i = 0; i < nativeMatches.length; i++) {
            const nativeMatch = nativeMatches[i];
            const ourMatch = result.matches[i];
            
            expect(ourMatch.text).toBe(nativeMatch[0]);
            expect(ourMatch.start).toBe(nativeMatch.index);
            expect(ourMatch.end).toBe(nativeMatch.index! + nativeMatch[0].length);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: regx-visual-builder, Property 8: Invalid regex graceful handling**
   * 
   * For any malformed regex string, the matcher SHALL return an error result
   * without throwing an uncaught exception.
   * 
   * **Validates: Requirements 4.4**
   */
  it('Property 8: Invalid regex graceful handling', () => {
    fc.assert(
      fc.property(
        arbInvalidPattern,
        arbTestString,
        (pattern: string, text: string) => {
          // Should not throw
          const result = findMatches(pattern, text);
          
          // Should return error result
          expect(result.success).toBe(false);
          expect(result.matches).toEqual([]);
          expect(result.error).toBeDefined();
          expect(typeof result.error).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Unit Tests for Edge Cases
// ============================================================================

describe('Matcher edge cases', () => {
  it('should return empty matches for empty pattern', () => {
    const result = findMatches('', 'test string');
    expect(result.success).toBe(true);
    expect(result.matches).toEqual([]);
  });

  it('should return empty matches for empty text', () => {
    const result = findMatches('\\d+', '');
    expect(result.success).toBe(true);
    expect(result.matches).toEqual([]);
  });

  it('should return empty matches when pattern does not match', () => {
    const result = findMatches('\\d+', 'no digits here');
    expect(result.success).toBe(true);
    expect(result.matches).toEqual([]);
  });

  it('should find multiple matches', () => {
    const result = findMatches('\\d+', 'abc123def456ghi789');
    expect(result.success).toBe(true);
    expect(result.matches.length).toBe(3);
    expect(result.matches[0]).toEqual({ text: '123', start: 3, end: 6 });
    expect(result.matches[1]).toEqual({ text: '456', start: 9, end: 12 });
    expect(result.matches[2]).toEqual({ text: '789', start: 15, end: 18 });
  });

  it('should handle overlapping match positions correctly', () => {
    const result = findMatches('[a-z]+', 'hello world');
    expect(result.success).toBe(true);
    expect(result.matches.length).toBe(2);
    expect(result.matches[0]).toEqual({ text: 'hello', start: 0, end: 5 });
    expect(result.matches[1]).toEqual({ text: 'world', start: 6, end: 11 });
  });

  it('should handle anchored patterns', () => {
    const result = findMatches('^hello', 'hello world');
    expect(result.success).toBe(true);
    expect(result.matches.length).toBe(1);
    expect(result.matches[0]).toEqual({ text: 'hello', start: 0, end: 5 });
  });

  it('should handle end anchor patterns', () => {
    const result = findMatches('world$', 'hello world');
    expect(result.success).toBe(true);
    expect(result.matches.length).toBe(1);
    expect(result.matches[0]).toEqual({ text: 'world', start: 6, end: 11 });
  });

  it('should handle special characters in pattern', () => {
    const result = findMatches('\\.', 'a.b.c');
    expect(result.success).toBe(true);
    expect(result.matches.length).toBe(2);
    expect(result.matches[0]).toEqual({ text: '.', start: 1, end: 2 });
    expect(result.matches[1]).toEqual({ text: '.', start: 3, end: 4 });
  });
});
