/**
 * Type definitions for RegX Visual Regex Builder
 * Contains all TypeScript interfaces for blocks, tokens, and match results
 */

// ============================================================================
// Block Types - Visual builder components
// ============================================================================

/** Supported block types in the visual builder */
export type BlockType =
  | 'START'
  | 'END'
  | 'TEXT'
  | 'DIGIT'
  | 'WHITESPACE'
  | 'OPTIONAL'
  | 'CHAR_CLASS'
  | 'ONE_OR_MORE'
  | 'ZERO_OR_MORE'
  | 'WORD'
  | 'ANY_CHAR'
  | 'GROUP';

/** Base interface for all blocks */
interface BaseBlock {
  id: string;
  type: BlockType;
}

/** Start of line anchor block (^) */
export interface StartBlock extends BaseBlock {
  type: 'START';
}

/** End of line anchor block ($) */
export interface EndBlock extends BaseBlock {
  type: 'END';
}

/** Literal text block with escapable content */
export interface TextBlock extends BaseBlock {
  type: 'TEXT';
  value: string;
}

/** Digit block with count quantifier (\d{N}) */
export interface DigitBlock extends BaseBlock {
  type: 'DIGIT';
  count: number;
}

/** Whitespace character block (\s) */
export interface WhitespaceBlock extends BaseBlock {
  type: 'WHITESPACE';
}

/** Optional content block (C?) */
export interface OptionalBlock extends BaseBlock {
  type: 'OPTIONAL';
  content: string;
}

/** Character class block [chars] with optional quantifier */
export interface CharClassBlock extends BaseBlock {
  type: 'CHAR_CLASS';
  value: string; // e.g., "a-zA-Z0-9._%+-"
  quantifier: 'one' | 'oneOrMore' | 'zeroOrMore' | 'optional' | 'range';
  min?: number;
  max?: number;
}

/** One or more quantifier block (+) */
export interface OneOrMoreBlock extends BaseBlock {
  type: 'ONE_OR_MORE';
  content: string;
}

/** Zero or more quantifier block (*) */
export interface ZeroOrMoreBlock extends BaseBlock {
  type: 'ZERO_OR_MORE';
  content: string;
}

/** Word character block (\w) */
export interface WordBlock extends BaseBlock {
  type: 'WORD';
  quantifier: 'one' | 'oneOrMore' | 'zeroOrMore' | 'optional';
}

/** Any character block (.) */
export interface AnyCharBlock extends BaseBlock {
  type: 'ANY_CHAR';
  quantifier: 'one' | 'oneOrMore' | 'zeroOrMore' | 'optional';
}

/** Group block for grouping patterns */
export interface GroupBlock extends BaseBlock {
  type: 'GROUP';
  content: string;
  quantifier: 'one' | 'oneOrMore' | 'zeroOrMore' | 'optional' | 'range';
  min?: number;
  max?: number;
}

/** Union type of all block variants */
export type Block =
  | StartBlock
  | EndBlock
  | TextBlock
  | DigitBlock
  | WhitespaceBlock
  | OptionalBlock
  | CharClassBlock
  | OneOrMoreBlock
  | ZeroOrMoreBlock
  | WordBlock
  | AnyCharBlock
  | GroupBlock;


// ============================================================================
// Token Types - Regex tokenizer output
// ============================================================================

/** Supported token types from regex parsing */
export type TokenType =
  | 'ANCHOR_START'
  | 'ANCHOR_END'
  | 'DIGIT'
  | 'WHITESPACE'
  | 'CHAR_CLASS'
  | 'LITERAL'
  | 'QUANTIFIER';

/** Quantifier information attached to tokens */
export interface Quantifier {
  type: 'exact' | 'range' | 'plus' | 'star' | 'optional';
  count?: number;
  min?: number;
  max?: number;
}

/** A single parsed token from a regex string */
export interface Token {
  type: TokenType;
  /** Original regex substring */
  raw: string;
  /** Human-readable description */
  description: string;
  /** Optional quantifier modifier */
  quantifier?: Quantifier;
}

/** Result of tokenizing a regex string */
export interface TokenizeResult {
  success: boolean;
  tokens: Token[];
  error?: string;
}

// ============================================================================
// Match Result Types - Pattern matcher output
// ============================================================================

/** A single match found in test text */
export interface Match {
  text: string;
  start: number;
  end: number;
}

/** Result of matching a pattern against test text */
export interface MatchResult {
  success: boolean;
  matches: Match[];
  error?: string;
}

// ============================================================================
// Store Types - Zustand state management
// ============================================================================

/** Zustand store state and actions */
export interface RegexStore {
  blocks: Block[];
  compiledRegex: string;
  testText: string;
  explainerInput: string;

  // Actions
  addBlock: (type: BlockType) => void;
  removeBlock: (id: string) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  setTestText: (text: string) => void;
  setExplainerInput: (input: string) => void;
}
