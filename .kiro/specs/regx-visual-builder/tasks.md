# Implementation Plan

- [x] 1. Set up project structure and dependencies
  - [x] 1.1 Install required dependencies (zustand, @formkit/auto-animate, fast-check, lucide-react)
    - Run npm install for zustand, @formkit/auto-animate, lucide-react
    - Run npm install -D fast-check for property testing
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 1.2 Create directory structure and type definitions
    - Create `lib/` directory with `types.ts` containing Block, Token, MatchResult interfaces
    - Create `store/` directory for Zustand store
    - Create `components/` directory for UI components
    - _Requirements: 2.1, 3.1_

- [x] 2. Implement Block-to-Regex Compiler
  - [x] 2.1 Create compiler core function
    - Implement `compileBlocksToRegex(blocks: Block[]): string` in `lib/compiler.ts`
    - Handle each block type: START→`^`, END→`$`, DIGIT→`\d{N}`, WHITESPACE→`\s`, OPTIONAL→`C?`
    - Implement `escapeRegexChars(text: string)` helper for Text blocks
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_
  - [x] 2.2 Write property tests for compiler
    - **Property 1: Compiler produces valid regex**
    - **Property 2: Compiler block-to-regex mapping**
    - **Property 3: Text block special character escaping**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

- [x] 3. Implement Regex Tokenizer and Pretty-Printer
  - [x] 3.1 Create tokenizer function
    - Implement `tokenizeRegex(input: string): TokenizeResult` in `lib/tokenizer.ts`
    - Parse anchors (`^`, `$`), character classes (`\d`, `\s`, `[a-z]`, `[A-Z]`, `[0-9]`)
    - Parse quantifiers (`{N}`, `+`, `*`, `?`) and attach to preceding token
    - Handle unrecognized patterns as literals
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.14_
  - [x] 3.2 Create pretty-printer function
    - Implement `tokensToRegex(tokens: Token[]): string` in `lib/pretty-printer.ts`
    - Reconstruct regex string from token array
    - _Requirements: 3.15_
  - [x] 3.3 Write property tests for tokenizer and pretty-printer
    - **Property 4: Tokenizer-PrettyPrinter round-trip**
    - **Property 5: Tokenizer description mapping**
    - **Property 6: Tokenizer quantifier handling**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.15**

- [x] 4. Implement Pattern Matcher
  - [x] 4.1 Create matcher function
    - Implement `findMatches(pattern: string, text: string): MatchResult` in `lib/matcher.ts`
    - Use try-catch around RegExp constructor for invalid patterns
    - Return match positions for highlighting
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [x] 4.2 Write property tests for matcher
    - **Property 7: Matcher correctness**
    - **Property 8: Invalid regex graceful handling**
    - **Validates: Requirements 4.1, 4.2, 4.4**

- [ ] 5. Checkpoint - Ensure all core logic tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement Zustand Store
  - [ ] 6.1 Create regex store
    - Implement `useRegexStore` in `store/regex-store.ts`
    - State: blocks, compiledRegex, testText, explainerInput
    - Actions: addBlock, removeBlock, updateBlock, setTestText, setExplainerInput
    - Auto-compile regex when blocks change
    - _Requirements: 1.2, 1.3, 1.4_
  - [ ] 6.2 Write property tests for store operations
    - **Property 9: Block list addition**
    - **Property 10: Block list deletion**
    - **Validates: Requirements 1.2, 1.3**

- [ ] 7. Build UI Components - Block Sidebar
  - [ ] 7.1 Create BlockSidebar component
    - Implement `components/block-sidebar.tsx` as client component
    - Display available block types with icons (lucide-react)
    - Add click handler to call store's addBlock action
    - Style with dark theme (Slate/Zinc 900)
    - _Requirements: 1.1, 5.1, 6.1_

- [ ] 8. Build UI Components - Regex Strip
  - [ ] 8.1 Create BlockCard component
    - Implement `components/block-card.tsx` as client component
    - Render block with type label and delete button
    - Show input field for Text and Digit blocks
    - _Requirements: 1.5, 1.6_
  - [ ] 8.2 Create RegexStrip component
    - Implement `components/regex-strip.tsx` as client component
    - Use auto-animate for smooth block transitions
    - Render BlockCard for each block in store
    - _Requirements: 1.2, 1.3, 6.2_

- [ ] 9. Build UI Components - Preview and Playground
  - [ ] 9.1 Create RegexPreview component
    - Implement `components/regex-preview.tsx` as client component
    - Display compiled regex from store
    - Add copy-to-clipboard button
    - _Requirements: 1.4_
  - [ ] 9.2 Create Playground component
    - Implement `components/playground.tsx` as client component
    - Text input for test string
    - Highlight matches using matcher results
    - Show error state for invalid patterns
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.3_

- [ ] 10. Build UI Components - Explainer
  - [ ] 10.1 Create Explainer component
    - Implement `components/explainer.tsx` as client component
    - Input field for pasting regex
    - Render token cards with descriptions
    - Show reconstructed regex from pretty-printer
    - _Requirements: 3.1, 3.13, 3.15_

- [ ] 11. Assemble Main Application Layout
  - [ ] 11.1 Update app layout and page
    - Update `app/layout.tsx` with dark theme globals
    - Update `app/globals.css` with Slate/Zinc color scheme
    - Implement `app/page.tsx` with CSS Grid layout
    - Arrange: Sidebar (left), RegexStrip + Preview (center), Playground + Explainer (bottom/right)
    - _Requirements: 5.1, 5.2, 6.1, 6.2, 6.3, 6.4_

- [ ] 12. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
