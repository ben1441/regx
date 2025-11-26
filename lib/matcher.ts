/**
 * Pattern Matcher for RegX Visual Regex Builder
 * Executes regex patterns against test text and returns match positions
 */

import { MatchResult, Match } from './types';

/**
 * Finds all matches of a regex pattern in the given text.
 * Uses try-catch to gracefully handle invalid regex patterns.
 * 
 * @param pattern - The regex pattern string to match
 * @param text - The text to search for matches
 * @returns MatchResult containing success status, matches array, and optional error
 * 
 * @example
 * ```typescript
 * const result = findMatches('\\d+', 'abc123def456');
 * // { success: true, matches: [{ text: '123', start: 3, end: 6 }, { text: '456', start: 9, end: 12 }] }
 * ```
 */
export function findMatches(pattern: string, text: string): MatchResult {
  // Handle empty pattern - no matches possible
  if (pattern === '') {
    return {
      success: true,
      matches: []
    };
  }

  try {
    // Create RegExp with global flag to find all matches
    // This validates the pattern even if text is empty
    const regex = new RegExp(pattern, 'g');

    // Handle empty text - no matches possible but pattern is valid
    if (text === '') {
      return {
        success: true,
        matches: []
      };
    }

    const matches: Match[] = [];

    // Use matchAll to get all matches with their positions
    const matchIterator = text.matchAll(regex);

    for (const match of matchIterator) {
      if (match.index !== undefined) {
        matches.push({
          text: match[0],
          start: match.index,
          end: match.index + match[0].length
        });
      }
    }

    return {
      success: true,
      matches
    };
  } catch (error) {
    // Handle invalid regex patterns gracefully
    const errorMessage = error instanceof Error ? error.message : 'Invalid regex pattern';
    return {
      success: false,
      matches: [],
      error: errorMessage
    };
  }
}
