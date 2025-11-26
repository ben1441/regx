/**
 * Property-based tests for the Zustand Regex Store
 * Uses fast-check for property testing
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fc from "fast-check";
import { useRegexStore } from "../../store/regex-store";
import type { BlockType } from "../../lib/types";

// ============================================================================
// Test Setup - Reset store before each test
// ============================================================================

beforeEach(() => {
  // Reset the store to initial state before each test
  useRegexStore.setState({
    blocks: [],
    compiledRegex: "",
    testText: "",
    explainerInput: "",
  });
});

// ============================================================================
// Arbitrary generators
// ============================================================================

/** Generate a valid block type */
const arbBlockType: fc.Arbitrary<BlockType> = fc.constantFrom(
  "START",
  "END",
  "TEXT",
  "DIGIT",
  "WHITESPACE",
  "OPTIONAL"
);

/** Generate an array of block types to add */
const arbBlockTypeArray = fc.array(arbBlockType, { minLength: 0, maxLength: 10 });

// ============================================================================
// Property Tests
// ============================================================================

describe("Zustand Regex Store", () => {
  /**
   * **Feature: regx-visual-builder, Property 9: Block list addition**
   *
   * For any block list and any valid block type, adding a block SHALL:
   * - Increase the list length by exactly one if the block is allowed
   * - Prevent duplicate START/END blocks (no-op if already present)
   * - Insert START at index 0, END at last index, others before END
   *
   * **Validates: Requirements 1.2**
   */
  it("Property 9: Block list addition", () => {
    fc.assert(
      fc.property(arbBlockTypeArray, arbBlockType, (initialTypes, newType) => {
        // Reset store
        useRegexStore.setState({
          blocks: [],
          compiledRegex: "",
          testText: "",
          explainerInput: "",
        });

        // Add initial blocks
        const { addBlock } = useRegexStore.getState();
        for (const type of initialTypes) {
          addBlock(type);
        }

        const blocksBefore = useRegexStore.getState().blocks;
        const initialLength = blocksBefore.length;

        // Check if this type already exists (for START/END constraint)
        const hasStart = blocksBefore.some((b) => b.type === "START");
        const hasEnd = blocksBefore.some((b) => b.type === "END");
        const isDuplicateAnchor =
          (newType === "START" && hasStart) || (newType === "END" && hasEnd);

        // Add the new block
        addBlock(newType);

        const finalState = useRegexStore.getState();

        if (isDuplicateAnchor) {
          // Duplicate START/END should be rejected (no change)
          expect(finalState.blocks.length).toBe(initialLength);
        } else {
          // Length should increase by exactly 1
          expect(finalState.blocks.length).toBe(initialLength + 1);

          // The new block should appear in the list with correct type
          const newBlock = finalState.blocks.find(
            (b) => !blocksBefore.some((old) => old.id === b.id)
          );
          expect(newBlock).toBeDefined();
          expect(newBlock!.type).toBe(newType);

          // Verify anchor positioning constraints
          const startIdx = finalState.blocks.findIndex((b) => b.type === "START");
          const endIdx = finalState.blocks.findIndex((b) => b.type === "END");

          if (startIdx !== -1) {
            expect(startIdx).toBe(0); // START must be at index 0
          }
          if (endIdx !== -1) {
            expect(endIdx).toBe(finalState.blocks.length - 1); // END must be last
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: regx-visual-builder, Property 10: Block list deletion**
   *
   * For any non-empty block list and any block ID present in the list, deleting
   * that block SHALL decrease the list length by exactly one and the block SHALL
   * no longer appear in the list.
   *
   * **Validates: Requirements 1.3**
   */
  it("Property 10: Block list deletion", () => {
    fc.assert(
      fc.property(
        // Generate at least 1 block type to ensure non-empty list
        fc.array(arbBlockType, { minLength: 1, maxLength: 10 }),
        (blockTypes) => {
          // Reset store
          useRegexStore.setState({
            blocks: [],
            compiledRegex: "",
            testText: "",
            explainerInput: "",
          });

          // Add blocks
          const { addBlock, removeBlock } = useRegexStore.getState();
          for (const type of blockTypes) {
            addBlock(type);
          }

          const blocksBeforeDelete = useRegexStore.getState().blocks;
          const initialLength = blocksBeforeDelete.length;

          // Pick a random block to delete (using the first one for determinism)
          const blockToDelete = blocksBeforeDelete[0];
          const idToDelete = blockToDelete.id;

          // Delete the block
          removeBlock(idToDelete);

          const finalState = useRegexStore.getState();

          // Length should decrease by exactly 1
          expect(finalState.blocks.length).toBe(initialLength - 1);

          // The deleted block should no longer be in the list
          const foundBlock = finalState.blocks.find((b) => b.id === idToDelete);
          expect(foundBlock).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  // ============================================================================
  // Additional unit tests for store functionality
  // ============================================================================

  describe("Store actions", () => {
    it("should auto-compile regex when blocks are added", () => {
      const { addBlock } = useRegexStore.getState();

      addBlock("START");
      expect(useRegexStore.getState().compiledRegex).toBe("^");

      addBlock("DIGIT");
      expect(useRegexStore.getState().compiledRegex).toBe("^\\d{1}");

      addBlock("END");
      expect(useRegexStore.getState().compiledRegex).toBe("^\\d{1}$");
    });

    it("should auto-compile regex when blocks are removed", () => {
      const { addBlock, removeBlock } = useRegexStore.getState();

      addBlock("START");
      addBlock("DIGIT");
      addBlock("END");

      const blocks = useRegexStore.getState().blocks;
      const digitBlockId = blocks[1].id;

      removeBlock(digitBlockId);
      expect(useRegexStore.getState().compiledRegex).toBe("^$");
    });

    it("should update TEXT block value correctly", () => {
      const { addBlock, updateBlock } = useRegexStore.getState();

      addBlock("TEXT");
      const textBlock = useRegexStore.getState().blocks[0];

      updateBlock(textBlock.id, { value: "hello" });

      const updatedBlock = useRegexStore.getState().blocks[0];
      expect(updatedBlock.type).toBe("TEXT");
      if (updatedBlock.type === "TEXT") {
        expect(updatedBlock.value).toBe("hello");
      }
      expect(useRegexStore.getState().compiledRegex).toBe("hello");
    });

    it("should update DIGIT block count correctly", () => {
      const { addBlock, updateBlock } = useRegexStore.getState();

      addBlock("DIGIT");
      const digitBlock = useRegexStore.getState().blocks[0];

      updateBlock(digitBlock.id, { count: 5 });

      const updatedBlock = useRegexStore.getState().blocks[0];
      expect(updatedBlock.type).toBe("DIGIT");
      if (updatedBlock.type === "DIGIT") {
        expect(updatedBlock.count).toBe(5);
      }
      expect(useRegexStore.getState().compiledRegex).toBe("\\d{5}");
    });

    it("should update OPTIONAL block content correctly", () => {
      const { addBlock, updateBlock } = useRegexStore.getState();

      addBlock("OPTIONAL");
      const optionalBlock = useRegexStore.getState().blocks[0];

      updateBlock(optionalBlock.id, { content: "abc" });

      const updatedBlock = useRegexStore.getState().blocks[0];
      expect(updatedBlock.type).toBe("OPTIONAL");
      if (updatedBlock.type === "OPTIONAL") {
        expect(updatedBlock.content).toBe("abc");
      }
      expect(useRegexStore.getState().compiledRegex).toBe("(?:abc)?");
    });

    it("should set test text correctly", () => {
      const { setTestText } = useRegexStore.getState();

      setTestText("test string 123");
      expect(useRegexStore.getState().testText).toBe("test string 123");
    });

    it("should set explainer input correctly", () => {
      const { setExplainerInput } = useRegexStore.getState();

      setExplainerInput("^\\d{3}$");
      expect(useRegexStore.getState().explainerInput).toBe("^\\d{3}$");
    });

    it("should not modify other blocks when updating one", () => {
      const { addBlock, updateBlock } = useRegexStore.getState();

      addBlock("TEXT");
      addBlock("DIGIT");
      addBlock("TEXT");

      const blocks = useRegexStore.getState().blocks;
      const firstTextId = blocks[0].id;
      const digitId = blocks[1].id;
      const secondTextId = blocks[2].id;

      updateBlock(firstTextId, { value: "updated" });

      const updatedBlocks = useRegexStore.getState().blocks;

      // First block should be updated
      expect(updatedBlocks[0].type).toBe("TEXT");
      if (updatedBlocks[0].type === "TEXT") {
        expect(updatedBlocks[0].value).toBe("updated");
      }

      // Other blocks should remain unchanged
      expect(updatedBlocks[1].id).toBe(digitId);
      expect(updatedBlocks[2].id).toBe(secondTextId);
    });

    it("should handle removing non-existent block ID gracefully", () => {
      const { addBlock, removeBlock } = useRegexStore.getState();

      addBlock("START");
      addBlock("END");

      const initialLength = useRegexStore.getState().blocks.length;

      // Try to remove a non-existent ID
      removeBlock("non-existent-id");

      // Length should remain the same
      expect(useRegexStore.getState().blocks.length).toBe(initialLength);
    });
  });
});
