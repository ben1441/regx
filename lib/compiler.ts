/**
 * Block-to-Regex Compiler
 * Transforms an array of visual blocks into a valid regex string
 */

import type {
  Block,
  TextBlock,
  DigitBlock,
  OptionalBlock,
  CharClassBlock,
  OneOrMoreBlock,
  ZeroOrMoreBlock,
  WordBlock,
  AnyCharBlock,
  GroupBlock,
} from './types';

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
 * Builds a quantifier string based on quantifier type and range values.
 */
function buildQuantifier(
  quantifier: 'one' | 'oneOrMore' | 'zeroOrMore' | 'optional' | 'range',
  min?: number,
  max?: number
): string {
  switch (quantifier) {
    case 'oneOrMore':
      return '+';
    case 'zeroOrMore':
      return '*';
    case 'optional':
      return '?';
    case 'range':
      if (max !== undefined) {
        return `{${min ?? 1},${max}}`;
      }
      return `{${min ?? 1},}`;
    case 'one':
    default:
      return '';
  }
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
      if (optionalBlock.content.length > 1) {
        return `(?:${escapedContent})?`;
      }
      return `${escapedContent}?`;
    }

    case 'CHAR_CLASS': {
      const ccBlock = block as CharClassBlock;
      const quantifier = buildQuantifier(ccBlock.quantifier, ccBlock.min, ccBlock.max);
      return `[${ccBlock.value}]${quantifier}`;
    }

    case 'ONE_OR_MORE': {
      const omBlock = block as OneOrMoreBlock;
      const escaped = escapeRegexChars(omBlock.content);
      if (omBlock.content.length > 1) {
        return `(?:${escaped})+`;
      }
      return `${escaped}+`;
    }

    case 'ZERO_OR_MORE': {
      const zmBlock = block as ZeroOrMoreBlock;
      const escaped = escapeRegexChars(zmBlock.content);
      if (zmBlock.content.length > 1) {
        return `(?:${escaped})*`;
      }
      return `${escaped}*`;
    }

    case 'WORD': {
      const wordBlock = block as WordBlock;
      const quantifier = buildQuantifier(wordBlock.quantifier);
      return `\\w${quantifier}`;
    }

    case 'ANY_CHAR': {
      const anyBlock = block as AnyCharBlock;
      const quantifier = buildQuantifier(anyBlock.quantifier);
      return `.${quantifier}`;
    }

    case 'GROUP': {
      const groupBlock = block as GroupBlock;
      const quantifier = buildQuantifier(groupBlock.quantifier, groupBlock.min, groupBlock.max);
      return `(?:${groupBlock.content})${quantifier}`;
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
