"use client";

/**
 * BlockSidebar component - displays available block types for the visual regex builder.
 * Users can click on block types to add them to the Regex Strip.
 */

import {
  Play,
  Square,
  Type,
  Hash,
  Space,
  HelpCircle,
  Plus,
  Brackets,
  Repeat,
  Repeat1,
  LetterText,
  Circle,
  Group,
} from "lucide-react";
import { useRegexStore } from "@/store/regex-store";
import type { BlockType } from "@/lib/types";

/** Block type configuration with display info */
interface BlockConfig {
  type: BlockType;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: "anchors" | "matchers" | "quantifiers";
}

/** Available block types with their display configuration */
const BLOCK_CONFIGS: BlockConfig[] = [
  // Anchors
  {
    type: "START",
    label: "Start of Line",
    description: "^ anchor",
    icon: <Play className="w-4 h-4" />,
    category: "anchors",
  },
  {
    type: "END",
    label: "End of Line",
    description: "$ anchor",
    icon: <Square className="w-4 h-4" />,
    category: "anchors",
  },
  // Matchers
  {
    type: "TEXT",
    label: "Text",
    description: "Literal text",
    icon: <Type className="w-4 h-4" />,
    category: "matchers",
  },
  {
    type: "DIGIT",
    label: "Digit",
    description: "\\d{N}",
    icon: <Hash className="w-4 h-4" />,
    category: "matchers",
  },
  {
    type: "WHITESPACE",
    label: "Whitespace",
    description: "\\s",
    icon: <Space className="w-4 h-4" />,
    category: "matchers",
  },
  {
    type: "WORD",
    label: "Word Char",
    description: "\\w (a-z, 0-9, _)",
    icon: <LetterText className="w-4 h-4" />,
    category: "matchers",
  },
  {
    type: "ANY_CHAR",
    label: "Any Char",
    description: ". (any character)",
    icon: <Circle className="w-4 h-4" />,
    category: "matchers",
  },
  {
    type: "CHAR_CLASS",
    label: "Char Class",
    description: "[a-zA-Z0-9...]",
    icon: <Brackets className="w-4 h-4" />,
    category: "matchers",
  },
  // Quantifiers
  {
    type: "OPTIONAL",
    label: "Optional",
    description: "? (0 or 1)",
    icon: <HelpCircle className="w-4 h-4" />,
    category: "quantifiers",
  },
  {
    type: "ONE_OR_MORE",
    label: "One or More",
    description: "+ quantifier",
    icon: <Repeat1 className="w-4 h-4" />,
    category: "quantifiers",
  },
  {
    type: "ZERO_OR_MORE",
    label: "Zero or More",
    description: "* quantifier",
    icon: <Repeat className="w-4 h-4" />,
    category: "quantifiers",
  },
  {
    type: "GROUP",
    label: "Group",
    description: "(?:...) with quantifier",
    icon: <Group className="w-4 h-4" />,
    category: "quantifiers",
  },
];

const CATEGORIES = [
  { key: "anchors", label: "Anchors" },
  { key: "matchers", label: "Matchers" },
  { key: "quantifiers", label: "Quantifiers" },
] as const;


/**
 * BlockSidebar displays available block types as clickable cards.
 * Organized by category: Anchors, Matchers, Quantifiers.
 */
export function BlockSidebar() {
  const addBlock = useRegexStore((state) => state.addBlock);

  return (
    <aside
      className="w-64 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col gap-4 overflow-y-auto"
      aria-label="Available regex blocks"
    >
      <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
        Blocks
      </h2>

      {CATEGORIES.map((category) => (
        <div key={category.key} className="flex flex-col gap-2">
          <span className="text-xs text-zinc-500 uppercase tracking-wide">
            {category.label}
          </span>
          {BLOCK_CONFIGS.filter((c) => c.category === category.key).map(
            (config) => (
              <button
                key={config.type}
                onClick={() => addBlock(config.type)}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 
                           border border-zinc-700 hover:border-zinc-600 transition-colors
                           text-left group"
                aria-label={`Add ${config.label} block`}
              >
                <div
                  className="flex items-center justify-center w-7 h-7 rounded-md bg-zinc-700 
                              group-hover:bg-zinc-600 text-zinc-300 transition-colors"
                >
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-zinc-200">
                    {config.label}
                  </div>
                  <div className="text-xs text-zinc-500 truncate">
                    {config.description}
                  </div>
                </div>
                <Plus className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              </button>
            )
          )}
        </div>
      ))}
    </aside>
  );
}
