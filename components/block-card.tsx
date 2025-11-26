"use client";

/**
 * BlockCard component - renders a single block in the Regex Strip.
 * Displays block type label, delete button, and input fields for configurable blocks.
 */

import {
  X,
  Play,
  Square,
  Type,
  Hash,
  Space,
  HelpCircle,
  Brackets,
  Repeat,
  Repeat1,
  LetterText,
  Circle,
  Group,
} from "lucide-react";
import type { Block, BlockType } from "@/lib/types";

/** Props for the BlockCard component */
interface BlockCardProps {
  block: Block;
  onDelete: () => void;
  onUpdate: (updates: Partial<Block>) => void;
}

/** Block type display configuration */
interface BlockDisplay {
  label: string;
  icon: React.ReactNode;
  color: string;
}

/** Display configuration for each block type */
const BLOCK_DISPLAY: Record<BlockType, BlockDisplay> = {
  START: {
    label: "Start",
    icon: <Play className="w-4 h-4" />,
    color: "bg-emerald-900/50 border-emerald-700",
  },
  END: {
    label: "End",
    icon: <Square className="w-4 h-4" />,
    color: "bg-rose-900/50 border-rose-700",
  },
  TEXT: {
    label: "Text",
    icon: <Type className="w-4 h-4" />,
    color: "bg-blue-900/50 border-blue-700",
  },
  DIGIT: {
    label: "Digit",
    icon: <Hash className="w-4 h-4" />,
    color: "bg-amber-900/50 border-amber-700",
  },
  WHITESPACE: {
    label: "Space",
    icon: <Space className="w-4 h-4" />,
    color: "bg-purple-900/50 border-purple-700",
  },
  OPTIONAL: {
    label: "Optional",
    icon: <HelpCircle className="w-4 h-4" />,
    color: "bg-cyan-900/50 border-cyan-700",
  },
  CHAR_CLASS: {
    label: "Char Class",
    icon: <Brackets className="w-4 h-4" />,
    color: "bg-indigo-900/50 border-indigo-700",
  },
  ONE_OR_MORE: {
    label: "One+",
    icon: <Repeat1 className="w-4 h-4" />,
    color: "bg-orange-900/50 border-orange-700",
  },
  ZERO_OR_MORE: {
    label: "Zero+",
    icon: <Repeat className="w-4 h-4" />,
    color: "bg-pink-900/50 border-pink-700",
  },
  WORD: {
    label: "Word",
    icon: <LetterText className="w-4 h-4" />,
    color: "bg-teal-900/50 border-teal-700",
  },
  ANY_CHAR: {
    label: "Any",
    icon: <Circle className="w-4 h-4" />,
    color: "bg-slate-700/50 border-slate-600",
  },
  GROUP: {
    label: "Group",
    icon: <Group className="w-4 h-4" />,
    color: "bg-violet-900/50 border-violet-700",
  },
};

/** Quantifier options for select dropdowns */
const QUANTIFIER_OPTIONS = [
  { value: "one", label: "Once" },
  { value: "oneOrMore", label: "1+ times" },
  { value: "zeroOrMore", label: "0+ times" },
  { value: "optional", label: "Optional" },
  { value: "range", label: "Range {n,m}" },
] as const;


/**
 * BlockCard renders a visual representation of a single regex block.
 */
export function BlockCard({ block, onDelete, onUpdate }: BlockCardProps) {
  const display = BLOCK_DISPLAY[block.type];

  const renderInput = () => {
    switch (block.type) {
      case "TEXT":
        return (
          <input
            type="text"
            value={block.value}
            onChange={(e) => onUpdate({ value: e.target.value })}
            placeholder="text..."
            className="w-full px-2 py-1 text-sm bg-zinc-800 border border-zinc-600 
                       rounded text-zinc-200 placeholder-zinc-500
                       focus:outline-none focus:border-blue-500"
            aria-label="Text value"
          />
        );

      case "DIGIT":
        return (
          <input
            type="number"
            value={block.count}
            onChange={(e) =>
              onUpdate({ count: Math.max(1, parseInt(e.target.value) || 1) })
            }
            min={1}
            className="w-14 px-2 py-1 text-sm bg-zinc-800 border border-zinc-600 
                       rounded text-zinc-200 text-center
                       focus:outline-none focus:border-amber-500"
            aria-label="Digit count"
          />
        );

      case "OPTIONAL":
      case "ONE_OR_MORE":
      case "ZERO_OR_MORE":
        return (
          <input
            type="text"
            value={block.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="content..."
            className="w-full px-2 py-1 text-sm bg-zinc-800 border border-zinc-600 
                       rounded text-zinc-200 placeholder-zinc-500
                       focus:outline-none focus:border-cyan-500"
            aria-label="Content"
          />
        );

      case "CHAR_CLASS":
        return (
          <div className="flex flex-col gap-1.5 flex-1">
            <input
              type="text"
              value={block.value}
              onChange={(e) => onUpdate({ value: e.target.value })}
              placeholder="a-zA-Z0-9..."
              className="w-full px-2 py-1 text-sm bg-zinc-800 border border-zinc-600 
                         rounded text-zinc-200 placeholder-zinc-500 font-mono
                         focus:outline-none focus:border-indigo-500"
              aria-label="Character class"
            />
            <div className="flex gap-1.5 items-center">
              <select
                value={block.quantifier}
                onChange={(e) =>
                  onUpdate({
                    quantifier: e.target.value as typeof block.quantifier,
                  })
                }
                className="px-2 py-1 text-xs bg-zinc-800 border border-zinc-600 
                           rounded text-zinc-200 focus:outline-none"
                aria-label="Quantifier"
              >
                {QUANTIFIER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {block.quantifier === "range" && (
                <>
                  <input
                    type="number"
                    value={block.min ?? 1}
                    onChange={(e) =>
                      onUpdate({ min: Math.max(0, parseInt(e.target.value) || 0) })
                    }
                    min={0}
                    className="w-12 px-1 py-1 text-xs bg-zinc-800 border border-zinc-600 
                               rounded text-zinc-200 text-center"
                    aria-label="Min"
                  />
                  <span className="text-zinc-500 text-xs">to</span>
                  <input
                    type="number"
                    value={block.max ?? ""}
                    onChange={(e) =>
                      onUpdate({
                        max: e.target.value
                          ? Math.max(0, parseInt(e.target.value))
                          : undefined,
                      })
                    }
                    min={0}
                    placeholder="∞"
                    className="w-12 px-1 py-1 text-xs bg-zinc-800 border border-zinc-600 
                               rounded text-zinc-200 text-center placeholder-zinc-500"
                    aria-label="Max"
                  />
                </>
              )}
            </div>
          </div>
        );

      case "WORD":
      case "ANY_CHAR":
        return (
          <select
            value={block.quantifier}
            onChange={(e) =>
              onUpdate({ quantifier: e.target.value as typeof block.quantifier })
            }
            className="px-2 py-1 text-xs bg-zinc-800 border border-zinc-600 
                       rounded text-zinc-200 focus:outline-none"
            aria-label="Quantifier"
          >
            {QUANTIFIER_OPTIONS.slice(0, 4).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case "GROUP":
        return (
          <div className="flex flex-col gap-1.5 flex-1">
            <input
              type="text"
              value={block.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder="pattern..."
              className="w-full px-2 py-1 text-sm bg-zinc-800 border border-zinc-600 
                         rounded text-zinc-200 placeholder-zinc-500 font-mono
                         focus:outline-none focus:border-violet-500"
              aria-label="Group content"
            />
            <div className="flex gap-1.5 items-center">
              <select
                value={block.quantifier}
                onChange={(e) =>
                  onUpdate({
                    quantifier: e.target.value as typeof block.quantifier,
                  })
                }
                className="px-2 py-1 text-xs bg-zinc-800 border border-zinc-600 
                           rounded text-zinc-200 focus:outline-none"
                aria-label="Quantifier"
              >
                {QUANTIFIER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {block.quantifier === "range" && (
                <>
                  <input
                    type="number"
                    value={block.min ?? 1}
                    onChange={(e) =>
                      onUpdate({ min: Math.max(0, parseInt(e.target.value) || 0) })
                    }
                    min={0}
                    className="w-12 px-1 py-1 text-xs bg-zinc-800 border border-zinc-600 
                               rounded text-zinc-200 text-center"
                    aria-label="Min"
                  />
                  <span className="text-zinc-500 text-xs">to</span>
                  <input
                    type="number"
                    value={block.max ?? ""}
                    onChange={(e) =>
                      onUpdate({
                        max: e.target.value
                          ? Math.max(0, parseInt(e.target.value))
                          : undefined,
                      })
                    }
                    min={0}
                    placeholder="∞"
                    className="w-12 px-1 py-1 text-xs bg-zinc-800 border border-zinc-600 
                               rounded text-zinc-200 text-center placeholder-zinc-500"
                    aria-label="Max"
                  />
                </>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const hasInput = ![
    "START",
    "END",
    "WHITESPACE",
  ].includes(block.type);

  return (
    <div
      className={`flex items-start gap-2 p-3 rounded-r-lg border-y border-r ${display.color} 
                  transition-all hover:brightness-110`}
      data-block-id={block.id}
    >
      <div className="flex items-center gap-2 text-zinc-300 pt-1">
        {display.icon}
        <span className="text-sm font-medium">{display.label}</span>
      </div>

      {hasInput && <div className="flex-1 min-w-0">{renderInput()}</div>}

      <button
        onClick={onDelete}
        className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 
                   transition-colors mt-0.5"
        aria-label={`Delete ${display.label} block`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
