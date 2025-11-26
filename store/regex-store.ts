"use client";

/**
 * Zustand store for RegX Visual Regex Builder
 * Manages blocks, compiled regex, test text, and explainer input
 */

import { create } from "zustand";
import type {
  Block,
  BlockType,
  RegexStore,
  TextBlock,
  DigitBlock,
  OptionalBlock,
  CharClassBlock,
  OneOrMoreBlock,
  ZeroOrMoreBlock,
  WordBlock,
  AnyCharBlock,
  GroupBlock,
} from "../lib/types";
import { compileBlocksToRegex } from "../lib/compiler";

/**
 * Finds the correct insertion index for a new block, respecting anchor constraints.
 * START blocks must be at position 0, END blocks must be at the last position.
 * @param blocks - Current block array
 * @param type - Type of block being added
 * @returns The index where the new block should be inserted
 */
function getInsertionIndex(blocks: Block[], type: BlockType): number {
  if (type === "START") {
    return 0;
  }
  if (type === "END") {
    return blocks.length;
  }
  // Insert before END block if one exists, otherwise at the end
  const endIndex = blocks.findIndex((b) => b.type === "END");
  return endIndex === -1 ? blocks.length : endIndex;
}

/**
 * Validates if a reorder operation respects anchor constraints.
 * @param blocks - Block array after the proposed move
 * @returns true if the reorder is valid
 */
function isValidReorder(blocks: Block[]): boolean {
  const startIndex = blocks.findIndex((b) => b.type === "START");
  const endIndex = blocks.findIndex((b) => b.type === "END");

  // START must be at index 0 if present
  if (startIndex > 0) return false;
  // END must be at last index if present
  if (endIndex !== -1 && endIndex !== blocks.length - 1) return false;

  return true;
}

/**
 * Creates a new block with a unique ID based on the block type.
 * @param type - The type of block to create
 * @returns A new block instance with default values
 */
function createBlock(type: BlockType): Block {
  const id = crypto.randomUUID();

  switch (type) {
    case "START":
      return { id, type: "START" };
    case "END":
      return { id, type: "END" };
    case "TEXT":
      return { id, type: "TEXT", value: "" };
    case "DIGIT":
      return { id, type: "DIGIT", count: 1 };
    case "WHITESPACE":
      return { id, type: "WHITESPACE" };
    case "OPTIONAL":
      return { id, type: "OPTIONAL", content: "" };
    case "CHAR_CLASS":
      return { id, type: "CHAR_CLASS", value: "a-z", quantifier: "oneOrMore" };
    case "ONE_OR_MORE":
      return { id, type: "ONE_OR_MORE", content: "" };
    case "ZERO_OR_MORE":
      return { id, type: "ZERO_OR_MORE", content: "" };
    case "WORD":
      return { id, type: "WORD", quantifier: "oneOrMore" };
    case "ANY_CHAR":
      return { id, type: "ANY_CHAR", quantifier: "one" };
    case "GROUP":
      return { id, type: "GROUP", content: "", quantifier: "one" };
  }
}


/**
 * Zustand store for managing regex builder state.
 * Auto-compiles regex when blocks change.
 */
export const useRegexStore = create<RegexStore>((set, get) => ({
  blocks: [],
  compiledRegex: "",
  testText: "",
  explainerInput: "",

  /**
   * Adds a new block of the specified type at the correct position.
   * START blocks are inserted at index 0, END blocks at the end,
   * other blocks are inserted before any END block.
   * Prevents duplicate START/END blocks.
   */
  addBlock: (type: BlockType) => {
    const currentBlocks = get().blocks;

    // Prevent duplicate START or END blocks
    if (type === "START" && currentBlocks.some((b) => b.type === "START")) {
      return;
    }
    if (type === "END" && currentBlocks.some((b) => b.type === "END")) {
      return;
    }

    const newBlock = createBlock(type);
    const insertIndex = getInsertionIndex(currentBlocks, type);
    const newBlocks = [
      ...currentBlocks.slice(0, insertIndex),
      newBlock,
      ...currentBlocks.slice(insertIndex),
    ];

    set({
      blocks: newBlocks,
      compiledRegex: compileBlocksToRegex(newBlocks),
    });
  },

  /**
   * Removes a block by its ID from the block list.
   * Automatically recompiles the regex after removal.
   */
  removeBlock: (id: string) => {
    const newBlocks = get().blocks.filter((block) => block.id !== id);
    set({
      blocks: newBlocks,
      compiledRegex: compileBlocksToRegex(newBlocks),
    });
  },

  /**
   * Updates a block's properties by its ID.
   * Automatically recompiles the regex after update.
   */
  updateBlock: (id: string, updates: Partial<Block>) => {
    const newBlocks = get().blocks.map((block) => {
      if (block.id !== id) return block;

      // Type-safe updates based on block type
      switch (block.type) {
        case "TEXT": {
          const u = updates as Partial<TextBlock>;
          return { ...block, value: u.value ?? block.value };
        }
        case "DIGIT": {
          const u = updates as Partial<DigitBlock>;
          return { ...block, count: u.count ?? block.count };
        }
        case "OPTIONAL": {
          const u = updates as Partial<OptionalBlock>;
          return { ...block, content: u.content ?? block.content };
        }
        case "CHAR_CLASS": {
          const u = updates as Partial<CharClassBlock>;
          return {
            ...block,
            value: u.value ?? block.value,
            quantifier: u.quantifier ?? block.quantifier,
            min: u.min ?? block.min,
            max: u.max ?? block.max,
          };
        }
        case "ONE_OR_MORE": {
          const u = updates as Partial<OneOrMoreBlock>;
          return { ...block, content: u.content ?? block.content };
        }
        case "ZERO_OR_MORE": {
          const u = updates as Partial<ZeroOrMoreBlock>;
          return { ...block, content: u.content ?? block.content };
        }
        case "WORD": {
          const u = updates as Partial<WordBlock>;
          return { ...block, quantifier: u.quantifier ?? block.quantifier };
        }
        case "ANY_CHAR": {
          const u = updates as Partial<AnyCharBlock>;
          return { ...block, quantifier: u.quantifier ?? block.quantifier };
        }
        case "GROUP": {
          const u = updates as Partial<GroupBlock>;
          return {
            ...block,
            content: u.content ?? block.content,
            quantifier: u.quantifier ?? block.quantifier,
            min: u.min ?? block.min,
            max: u.max ?? block.max,
          };
        }
        default:
          return block;
      }
    });

    set({
      blocks: newBlocks,
      compiledRegex: compileBlocksToRegex(newBlocks),
    });
  },

  /**
   * Reorders blocks by moving a block from one index to another.
   * Validates that START stays at index 0 and END stays at last index.
   * Rejects invalid reorder operations silently.
   */
  reorderBlocks: (fromIndex: number, toIndex: number) => {
    const blocks = [...get().blocks];
    if (fromIndex < 0 || fromIndex >= blocks.length) return;
    if (toIndex < 0 || toIndex >= blocks.length) return;

    const [movedBlock] = blocks.splice(fromIndex, 1);
    blocks.splice(toIndex, 0, movedBlock);

    // Validate anchor constraints before applying
    if (!isValidReorder(blocks)) {
      return;
    }

    set({
      blocks,
      compiledRegex: compileBlocksToRegex(blocks),
    });
  },

  /**
   * Sets the test text for the playground.
   */
  setTestText: (text: string) => {
    set({ testText: text });
  },

  /**
   * Sets the explainer input for regex explanation.
   */
  setExplainerInput: (input: string) => {
    set({ explainerInput: input });
  },
}));
