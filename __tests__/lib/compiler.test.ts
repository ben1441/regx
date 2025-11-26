/**
 * Property-based tests for the Block-to-Regex Compiler
 * Uses fast-check for property testing
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { compileBlocksToRegex, escapeRegexChars } from '../../lib/compiler';
import type { Block, BlockType } from '../../lib/types';

// ============================================================================
// Arbitrary generators for blocks
// ============================================================================

/** Generate a unique ID */
const arbId = fc.uuid();

/** Generate a START block */
const arbStartBlock = arbId.map((id): Block => ({ id, type: 'START' }));

/** Generate an END block */
const arbEndBlock = arbId.map((id): Block => ({ id, type: 'END' }));

/** Generate a WHITESPACE block */
const arbWhitespaceBlock = arbId.map((id): Block => ({ id, type: 'WHITESPACE' }));

/** Generate a DIGIT block with positive count */
const arbDigitBlock = fc.tuple(arbId, fc.integer({ min: 1, max: 20 })).map(
  ([id, count]): Block => ({ id, type: 'DIGIT', count })
);

/** Generate a TEXT block with arbitrary string (excluding empty) */
const arbTextBlock = fc.tuple(arbId, fc.string({ minLength: 1, maxLength: 50 })).map(
  ([id, value]): Block => ({ id, type: 'TEXT', value })
);

/** Generate an OPTIONAL block with content */
const arbOptionalBlock = fc.tuple(arbId, fc.string({ minLength: 1, maxLength: 20 })).map(
  ([id, content]): Block => ({ id, type: 'OPTIONAL', content })
);

/** Generate any valid block */
const arbBlock: fc.Arbitrary<Block> = fc.oneof(
  arbStartBlock,
  arbEndBlock,
  arbWhitespaceBlock,
  arbDigitBlock,
  arbTextBlock,
  arbOptionalBlock
);

/** Generate an array of blocks */
const arbBlockArray = fc.array(arbBlock, { minLength: 0, maxLength: 10 });

/** Generate a string containing special regex characters */
const specialChars = '^$.*+?()[]{}|\\';
const normalChars = 'abc123 ';
const allChars = specialChars + normalChars;

const arbStringWithSpecialChars = fc
  .array(fc.constantFrom(...allChars.split('')), { minLength: 1, maxLength: 30 })
  .map((chars) => chars.join(''));

// ============================================================================
// Property Tests
// ============================================================================

describe('Block-to-Regex Compiler', () => {
  /**
   * **Feature: regx-visual-builder, Property 1: Compiler produces valid regex**
   * 
   * For any array of blocks, the compiled output SHALL be a syntactically valid
   * regex string that can be parsed by the JavaScript RegExp constructor without
   * throwing an exception.
   * 
   * **Validates: Requirements 2.1**
   */
  it('Property 1: Compiler produces valid regex', () => {
    fc.assert(
      fc.property(arbBlockArray, (blocks) => {
        const regex = compileBlocksToRegex(blocks);
        
        // The compiled regex should be parseable by RegExp without throwing
        expect(() => new RegExp(regex)).not.toThrow();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: regx-visual-builder, Property 2: Compiler block-to-regex mapping**
   * 
   * For any block in the supported block types (START, END, DIGIT, WHITESPACE, OPTIONAL),
   * the compiler SHALL produce the correct regex fragment:
   * - START → `^`
   * - END → `$`
   * - DIGIT with count N → `\d{N}`
   * - WHITESPACE → `\s`
   * - OPTIONAL with content C → `C?` or `(?:C)?` for multi-char
   * 
   * **Validates: Requirements 2.2, 2.3, 2.4, 2.6, 2.7**
   */
  it('Property 2: Compiler block-to-regex mapping', () => {
    // Test START block
    fc.assert(
      fc.property(arbStartBlock, (block) => {
        const regex = compileBlocksToRegex([block]);
        expect(regex).toBe('^');
      }),
      { numRuns: 100 }
    );

    // Test END block
    fc.assert(
      fc.property(arbEndBlock, (block) => {
        const regex = compileBlocksToRegex([block]);
        expect(regex).toBe('$');
      }),
      { numRuns: 100 }
    );

    // Test WHITESPACE block
    fc.assert(
      fc.property(arbWhitespaceBlock, (block) => {
        const regex = compileBlocksToRegex([block]);
        expect(regex).toBe('\\s');
      }),
      { numRuns: 100 }
    );

    // Test DIGIT block - should produce \d{N}
    fc.assert(
      fc.property(arbDigitBlock, (block) => {
        if (block.type !== 'DIGIT') return;
        const regex = compileBlocksToRegex([block]);
        expect(regex).toBe(`\\d{${block.count}}`);
      }),
      { numRuns: 100 }
    );

    // Test OPTIONAL block - should produce C? or (?:C)?
    fc.assert(
      fc.property(arbOptionalBlock, (block) => {
        if (block.type !== 'OPTIONAL') return;
        const regex = compileBlocksToRegex([block]);
        const escapedContent = escapeRegexChars(block.content);
        
        if (block.content.length > 1) {
          expect(regex).toBe(`(?:${escapedContent})?`);
        } else {
          expect(regex).toBe(`${escapedContent}?`);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: regx-visual-builder, Property 3: Text block special character escaping**
   * 
   * For any Text block containing special regex characters (^$.*+?()[]{}|\),
   * the compiler SHALL escape those characters so the compiled regex matches
   * the literal text.
   * 
   * **Validates: Requirements 2.5**
   */
  it('Property 3: Text block special character escaping', () => {
    fc.assert(
      fc.property(
        fc.tuple(arbId, arbStringWithSpecialChars),
        ([id, value]) => {
          const block: Block = { id, type: 'TEXT', value };
          const regex = compileBlocksToRegex([block]);
          
          // The compiled regex should be valid
          const re = new RegExp(regex);
          
          // The regex should match the original literal text
          expect(re.test(value)).toBe(true);
          
          // The regex should match exactly the value (not a subset)
          const match = value.match(re);
          expect(match).not.toBeNull();
          expect(match![0]).toBe(value);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Additional unit tests for edge cases
  describe('Edge cases', () => {
    it('should return empty string for empty block array', () => {
      expect(compileBlocksToRegex([])).toBe('');
    });

    it('should handle TEXT block with empty value', () => {
      const block: Block = { id: '1', type: 'TEXT', value: '' };
      expect(compileBlocksToRegex([block])).toBe('');
    });

    it('should handle DIGIT block with count 0 (defaults to 1)', () => {
      const block: Block = { id: '1', type: 'DIGIT', count: 0 };
      expect(compileBlocksToRegex([block])).toBe('\\d{1}');
    });

    it('should concatenate multiple blocks correctly', () => {
      const blocks: Block[] = [
        { id: '1', type: 'START' },
        { id: '2', type: 'TEXT', value: 'hello' },
        { id: '3', type: 'WHITESPACE' },
        { id: '4', type: 'DIGIT', count: 3 },
        { id: '5', type: 'END' },
      ];
      expect(compileBlocksToRegex(blocks)).toBe('^hello\\s\\d{3}$');
    });
  });
});

describe('escapeRegexChars', () => {
  it('should escape all special regex characters', () => {
    const special = '^$.*+?()[]{}|\\';
    const escaped = escapeRegexChars(special);
    expect(escaped).toBe('\\^\\$\\.\\*\\+\\?\\(\\)\\[\\]\\{\\}\\|\\\\');
  });

  it('should not modify strings without special characters', () => {
    const normal = 'hello world 123';
    expect(escapeRegexChars(normal)).toBe(normal);
  });
});
