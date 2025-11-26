"use client";

/**
 * RegexPreview component - displays the compiled regex string from the store.
 * Provides copy-to-clipboard functionality for easy regex export.
 * 
 * @requirements 1.4 - Display real-time preview of compiled regex string
 */

import { useState } from "react";
import { Copy, Check, Code } from "lucide-react";
import { useRegexStore } from "@/store/regex-store";

/**
 * RegexPreview renders the compiled regex with a copy button.
 * Shows visual feedback when regex is copied to clipboard.
 */
export function RegexPreview() {
  const compiledRegex = useRegexStore((state) => state.compiledRegex);
  const [copied, setCopied] = useState(false);

  /**
   * Copies the compiled regex to clipboard and shows feedback.
   */
  const handleCopy = async () => {
    if (!compiledRegex) return;

    try {
      await navigator.clipboard.writeText(compiledRegex);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      console.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="p-4 bg-zinc-900 border border-zinc-700 rounded-lg">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 text-zinc-400">
        <Code className="w-4 h-4" />
        <span className="text-sm font-medium">Compiled Regex</span>
      </div>

      {/* Regex display with copy button */}
      <div className="flex items-center gap-2">
        <code
          className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-600 rounded 
                     font-mono text-sm text-emerald-400 overflow-x-auto"
          aria-label="Compiled regex pattern"
        >
          {compiledRegex || <span className="text-zinc-500 italic">No pattern</span>}
        </code>

        <button
          onClick={handleCopy}
          disabled={!compiledRegex}
          className="p-2 rounded bg-zinc-800 border border-zinc-600 
                     text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
          aria-label={copied ? "Copied to clipboard" : "Copy regex to clipboard"}
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
