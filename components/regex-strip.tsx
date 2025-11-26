"use client";

/**
 * RegexStrip component - the main canvas area where blocks are assembled.
 * Supports drag-and-drop reordering and smooth animations.
 */

import { useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { GripVertical } from "lucide-react";
import { useRegexStore } from "@/store/regex-store";
import { BlockCard } from "./block-card";
import type { Block } from "@/lib/types";

/**
 * RegexStrip renders the current blocks from the store as a horizontal strip.
 * Blocks can be dragged to reorder, deleted, or updated.
 */
export function RegexStrip() {
  const blocks = useRegexStore((state) => state.blocks);
  const removeBlock = useRegexStore((state) => state.removeBlock);
  const updateBlock = useRegexStore((state) => state.updateBlock);
  const reorderBlocks = useRegexStore((state) => state.reorderBlocks);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Auto-animate hook for smooth transitions
  const [animateRef] = useAutoAnimate<HTMLDivElement>();

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedIndex !== null && index !== draggedIndex) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = draggedIndex;
    if (fromIndex !== null && fromIndex !== toIndex) {
      reorderBlocks(fromIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDelete = (id: string) => {
    removeBlock(id);
  };

  const handleUpdate = (id: string, updates: Partial<Block>) => {
    updateBlock(id, updates);
  };

  return (
    <div className="flex-1 bg-zinc-900 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          Regex Strip
        </h2>
        {blocks.length > 1 && (
          <span className="text-xs text-zinc-500">Drag to reorder</span>
        )}
      </div>

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
          blocks.map((block, index) => (
            <div
              key={block.id}
              role="listitem"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative flex items-stretch gap-0 rounded-lg transition-all
                ${draggedIndex === index ? "opacity-50" : ""}
                ${dragOverIndex === index ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-zinc-900" : ""}`}
            >
              {/* Drag handle */}
              <div
                className="flex items-center px-1 cursor-grab active:cursor-grabbing 
                           text-zinc-500 hover:text-zinc-300 bg-zinc-800/50 rounded-l-lg
                           border-y border-l border-zinc-700"
                aria-label="Drag to reorder"
              >
                <GripVertical className="w-4 h-4" />
              </div>
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
