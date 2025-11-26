"use client";

/**
 * RegexStrip component - the main canvas area where blocks are assembled.
 * Uses auto-animate for smooth block transitions when adding/removing blocks.
 */

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useRegexStore } from "@/store/regex-store";
import { BlockCard } from "./block-card";
import type { Block } from "@/lib/types";

/**
 * RegexStrip renders the current blocks from the store as a horizontal strip.
 * Blocks can be deleted or updated, and changes animate smoothly.
 */
export function RegexStrip() {
  const blocks = useRegexStore((state) => state.blocks);
  const removeBlock = useRegexStore((state) => state.removeBlock);
  const updateBlock = useRegexStore((state) => state.updateBlock);
  
  // Auto-animate hook for smooth transitions
  const [animateRef] = useAutoAnimate<HTMLDivElement>();

  /**
   * Handles block deletion by ID.
   */
  const handleDelete = (id: string) => {
    removeBlock(id);
  };

  /**
   * Handles block updates by ID.
   */
  const handleUpdate = (id: string, updates: Partial<Block>) => {
    updateBlock(id, updates);
  };

  return (
    <div className="flex-1 bg-zinc-900 p-4">
      <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
        Regex Strip
      </h2>
      
      {/* Block container with auto-animate */}
      <div
        ref={animateRef}
        className="flex flex-wrap gap-2 min-h-[60px] p-4 rounded-lg 
                   bg-zinc-800/50 border border-zinc-700 border-dashed"
        role="list"
        aria-label="Regex blocks"
      >
        {blocks.length === 0 ? (
          <p className="text-zinc-500 text-sm italic">
            Click blocks in the sidebar to start building your regex pattern
          </p>
        ) : (
          blocks.map((block) => (
            <div key={block.id} role="listitem">
              <BlockCard
                block={block}
                onDelete={() => handleDelete(block.id)}
                onUpdate={(updates) => handleUpdate(block.id, updates)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
