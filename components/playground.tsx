"use client";

/**
 * Playground component - real-time regex pattern testing area.
 * Allows users to enter test text and see matches highlighted.
 * 
 * @requirements 4.1 - Execute regex pattern against test text
 * @requirements 4.2 - Highlight matched portions with distinct background
 * @requirements 4.3 - Display text without highlighting when no matches
 * @requirements 4.4 - Display error indicator for invalid patterns
 * @requirements 5.3 - Use semi-transparent accent color for highlights
 */

import { useMemo } from "react";
import { FlaskConical, AlertCircle } from "lucide-react";
import { useRegexStore } from "@/store/regex-store";
import { findMatches } from "@/lib/matcher";
import type { Match } from "@/lib/types";

/**
 * Renders text with highlighted match segments.
 * Splits text into matched and unmatched portions for visual distinction.
 */
function HighlightedText({ text, matches }: { text: string; matches: Match[] }) {
  if (matches.length === 0) {
    return <span className="text-zinc-300">{text}</span>;
  }

  // Sort matches by start position
  const sortedMatches = [...matches].sort((a, b) => a.start - b.start);
  const segments: React.ReactNode[] = [];
  let lastEnd = 0;

  sortedMatches.forEach((match, index) => {
    // Add unmatched text before this match
    if (match.start > lastEnd) {
      segments.push(
        <span key={`text-${index}`} className="text-zinc-300">
          {text.slice(lastEnd, match.start)}
        </span>
      );
    }

    // Add matched text with highlight
    segments.push(
      <mark
        key={`match-${index}`}
        className="bg-emerald-500/30 text-emerald-300 rounded px-0.5"
      >
        {match.text}
      </mark>
    );

    lastEnd = match.end;
  });

  // Add remaining unmatched text
  if (lastEnd < text.length) {
    segments.push(
      <span key="text-end" className="text-zinc-300">
        {text.slice(lastEnd)}
      </span>
    );
  }

  return <>{segments}</>;
}

/**
 * Playground renders a test area for validating regex patterns.
 * Shows match count, error states, and highlighted matches in real-time.
 */
export function Playground() {
  const compiledRegex = useRegexStore((state) => state.compiledRegex);
  const testText = useRegexStore((state) => state.testText);
  const setTestText = useRegexStore((state) => state.setTestText);

  // Compute matches whenever regex or test text changes
  const matchResult = useMemo(() => {
    if (!compiledRegex || !testText) {
      return { success: true, matches: [] };
    }
    return findMatches(compiledRegex, testText);
  }, [compiledRegex, testText]);

  const hasError = !matchResult.success;
  const matchCount = matchResult.matches.length;

  return (
    <div className="p-4 bg-zinc-900 border border-zinc-700 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-zinc-400">
          <FlaskConical className="w-4 h-4" />
          <span className="text-sm font-medium">Playground</span>
        </div>

        {/* Match count or error indicator */}
        {hasError ? (
          <div className="flex items-center gap-1 text-rose-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Invalid pattern</span>
          </div>
        ) : (
          <span className="text-sm text-zinc-500">
            {matchCount} {matchCount === 1 ? "match" : "matches"}
          </span>
        )}
      </div>

      {/* Test text input */}
      <textarea
        value={testText}
        onChange={(e) => setTestText(e.target.value)}
        placeholder="Enter test text to match against..."
        className="w-full h-24 px-3 py-2 mb-3 bg-zinc-800 border border-zinc-600 rounded
                   font-mono text-sm text-zinc-200 placeholder-zinc-500 resize-none
                   focus:outline-none focus:border-emerald-500"
        aria-label="Test text input"
      />

      {/* Results display */}
      <div className="p-3 bg-zinc-800 border border-zinc-600 rounded min-h-[3rem]">
        {hasError ? (
          <div className="text-rose-400 text-sm">
            <span className="font-medium">Error:</span> {matchResult.error}
          </div>
        ) : testText ? (
          <div className="font-mono text-sm whitespace-pre-wrap break-all">
            <HighlightedText text={testText} matches={matchResult.matches} />
          </div>
        ) : (
          <span className="text-zinc-500 text-sm italic">
            Results will appear here...
          </span>
        )}
      </div>
    </div>
  );
}
