/**
 * Block-to-Regex Compiler
 * Transforms an array of visual blocks into a valid regex string
 */

import type { Block, TextBlock, DigitBlock, OptionalBlock } from './types';

/** Characters that have special meaning in regex and must be escaped */
const SPECIAL_REGEX_CHARS = /[\\^$.*+?()[\]{}|]/g;

/**
 * Escapes special regex characters in a string so they match literally.
 * @param text - The text to escape
 * @returns The escaped text safe for use in a regex pattern
 */
export function escapeRegexChars(text: string): string {
  return text.replace(SPECIAL_REGEX_CHARS, '\\$&');
}

/**
 * Compiles a single block into its regex string representation.
 * @param block - The block to compile
 * @returns The regex fragment for this block
 */
function compileBlock(block: Block): string {
  switch (block.type) {
    case 'START':
      return '^';
    case 'END':
      return '$';
    case 'DIGIT': {
      const digitBlock = block as DigitBlock;
      const count = digitBlock.count > 0 ? digitBlock.count : 1;
      return `\\d{${count}}`;
    }
    case 'WHITESPACE':
      return '\\s';
    case 'TEXT': {
      const textBlock = block as TextBlock;
      return escapeRegexChars(textBlock.value);
    }
    case 'OPTIONAL': {
      const optionalBlock = block as OptionalBlock;
      const escapedContent = escapeRegexChars(optionalBlock.content);
      // Wrap in non-capturing group if content has multiple chars
      if (optionalBlock.content.length > 1) {
        return `(?:${escapedContent})?`;
      }
      return `${escapedContent}?`;
    }
    default:
      return '';
  }
}

/**
 * Compiles an array of blocks into a valid regex string.
 * @param blocks - The array of blocks to compile
 * @returns A syntactically valid regex string
 */
export function compileBlocksToRegex(blocks: Block[]): string {
  if (blocks.length === 0) {
    return '';
  }
  return blocks.map(compileBlock).join('');
}
