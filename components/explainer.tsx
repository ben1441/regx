"use client";

/**
 * Explainer component - parses and explains regex patterns.
 * Allows users to paste a regex and see human-readable token descriptions.
 *
 * @requirements 3.1 - Parse regex string into discrete tokens
 * @requirements 3.13 - Render each token as a visual card with description
 * @requirements 3.15 - Provide pretty-printer that reconstructs regex from tokens
 */

import { useMemo } from "react";
import { BookOpen, AlertCircle, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useRegexStore } from "@/store/regex-store";
import { tokenizeRegex } from "@/lib/tokenizer";
import { tokensToRegex } from "@/lib/pretty-printer";
import type { Token, TokenType } from "@/lib/types";

/** Token type display configuration */
interface TokenDisplay {
  label: string;
  color: string;
}

/** Display configuration for each token type */
const TOKEN_DISPLAY: Record<TokenType, TokenDisplay> = {
  ANCHOR_START: {
    label: "Anchor",
    color: "bg-emerald-900/50 border-emerald-700 text-emerald-300",
  },
  ANCHOR_END: {
    label: "Anchor",
    color: "bg-rose-900/50 border-rose-700 text-rose-300",
  },
  DIGIT: {
    label: "Digit",
    color: "bg-amber-900/50 border-amber-700 text-amber-300",
  },
  WHITESPACE: {
    label: "Whitespace",
    color: "bg-purple-900/50 border-purple-700 text-purple-300",
  },
  CHAR_CLASS: {
    label: "Character Class",
    color: "bg-blue-900/50 border-blue-700 text-blue-300",
  },
  LITERAL: {
    label: "Literal",
    color: "bg-zinc-800 border-zinc-600 text-zinc-300",
  },
  QUANTIFIER: {
    label: "Quantifier",
    color: "bg-cyan-900/50 border-cyan-700 text-cyan-300",
  },
};


/**
 * TokenCard renders a single token with its description.
 * Shows the raw regex pattern and human-readable explanation.
 */
function TokenCard({ token }: { token: Token }) {
  const display = TOKEN_DISPLAY[token.type];

  return (
    <div
      className={`flex flex-col gap-1 p-3 rounded-lg border ${display.color} transition-all`}
    >
      {/* Token type label and raw value */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium opacity-70">{display.label}</span>
        <code className="px-1.5 py-0.5 text-xs bg-zinc-900/50 rounded font-mono">
          {token.raw}
        </code>
      </div>

      {/* Human-readable description */}
      <p className="text-sm">{token.description}</p>
    </div>
  );
}

/**
 * Explainer renders an input for pasting regex and displays token explanations.
 * Shows the reconstructed regex from the pretty-printer for verification.
 */
export function Explainer() {
  const explainerInput = useRegexStore((state) => state.explainerInput);
  const setExplainerInput = useRegexStore((state) => state.setExplainerInput);
  const [copied, setCopied] = useState(false);

  // Tokenize the input regex
  const tokenResult = useMemo(() => {
    if (!explainerInput) {
      return { success: true, tokens: [] };
    }
    return tokenizeRegex(explainerInput);
  }, [explainerInput]);

  // Reconstruct regex from tokens using pretty-printer
  const reconstructedRegex = useMemo(() => {
    if (!tokenResult.success || tokenResult.tokens.length === 0) {
      return "";
    }
    return tokensToRegex(tokenResult.tokens);
  }, [tokenResult]);

  const hasError = !tokenResult.success;
  const hasTokens = tokenResult.tokens.length > 0;

  /**
   * Copies the reconstructed regex to clipboard
   */
  const handleCopy = async () => {
    if (reconstructedRegex) {
      await navigator.clipboard.writeText(reconstructedRegex);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-4 bg-zinc-900 border border-zinc-700 rounded-lg">
      {/* Header */}
      <div className="flex items-center gap-2 text-zinc-400 mb-3">
        <BookOpen className="w-4 h-4" />
        <span className="text-sm font-medium">Regex Explainer</span>
      </div>

      {/* Regex input */}
      <input
        type="text"
        value={explainerInput}
        onChange={(e) => setExplainerInput(e.target.value)}
        placeholder="Paste a regex to explain (e.g., ^\d{3}[a-z]+$)"
        className="w-full px-3 py-2 mb-3 bg-zinc-800 border border-zinc-600 rounded
                   font-mono text-sm text-zinc-200 placeholder-zinc-500
                   focus:outline-none focus:border-emerald-500"
        aria-label="Regex input for explanation"
      />

      {/* Error display */}
      {hasError && (
        <div className="flex items-center gap-2 p-3 mb-3 bg-rose-900/30 border border-rose-700 rounded text-rose-300 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{tokenResult.error}</span>
        </div>
      )}

      {/* Token cards */}
      {hasTokens && (
        <div className="space-y-2 mb-3">
          <span className="text-xs text-zinc-500 uppercase tracking-wide">
            Tokens ({tokenResult.tokens.length})
          </span>
          <div className="grid gap-2">
            {tokenResult.tokens.map((token, index) => (
              <TokenCard key={`${token.raw}-${index}`} token={token} />
            ))}
          </div>
        </div>
      )}

      {/* Reconstructed regex display */}
      {reconstructedRegex && (
        <div className="p-3 bg-zinc-800 border border-zinc-600 rounded">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-500 uppercase tracking-wide">
              Reconstructed
            </span>
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
              aria-label="Copy reconstructed regex"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <code className="text-sm font-mono text-emerald-400">
            {reconstructedRegex}
          </code>
        </div>
      )}

      {/* Empty state */}
      {!hasTokens && !hasError && (
        <div className="p-3 bg-zinc-800 border border-zinc-600 rounded">
          <span className="text-zinc-500 text-sm italic">
            Enter a regex pattern above to see its explanation...
          </span>
        </div>
      )}
    </div>
  );
}
