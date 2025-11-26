# Requirements Document

## Introduction

RegX is a deterministic visual regex builder micro-tool that enables users to construct and understand Regular Expressions without knowing regex syntax. The application provides a block-based visual builder for creating regex patterns, a no-LLM explainer that translates regex to human-readable descriptions, and a playground for real-time pattern testing. All logic is 100% deterministic TypeScript with no external AI API dependencies.

## Glossary

- **Block**: A visual UI element representing a single regex component (e.g., "Start of Line", "Digit", "Text")
- **Regex Strip**: The main canvas area where blocks are assembled to form a complete pattern
- **Compiler**: The function that transforms an array of blocks into a valid regex string
- **Tokenizer**: A utility that parses a raw regex string into discrete tokens for explanation
- **Token**: A single parsed element from a regex string (e.g., `^`, `\d`, `[a-z]`)
- **Playground**: The testing area where users validate regex patterns against sample text

## Requirements

### Requirement 1: Block-Based Visual Builder

**User Story:** As a user unfamiliar with regex syntax, I want to build regex patterns by stacking visual blocks, so that I can create patterns without memorizing cryptic syntax.

#### Acceptance Criteria

1. WHEN a user views the application THEN the RegX System SHALL display a sidebar containing available block types: "Start of Line", "Text", "Digit", "Whitespace", "Optional", "End of Line"
2. WHEN a user clicks "Add Block" for a block type THEN the RegX System SHALL append that block to the Regex Strip with smooth animation
3. WHEN a user deletes a block from the Regex Strip THEN the RegX System SHALL remove the block and collapse the gap with smooth animation
4. WHEN blocks exist in the Regex Strip THEN the RegX System SHALL display a real-time preview of the compiled regex string
5. WHEN a user adds a "Text" block THEN the RegX System SHALL provide an input field for the user to specify the literal text to match
6. WHEN a user adds a "Digit" block THEN the RegX System SHALL provide an input field for specifying the count or range of digits

### Requirement 2: Block-to-Regex Compiler

**User Story:** As a developer, I want the block array to compile into a valid regex string, so that the visual representation produces usable patterns.

#### Acceptance Criteria

1. WHEN the Compiler receives an array of blocks THEN the Compiler SHALL return a syntactically valid regex string
2. WHEN the Compiler processes a "Start of Line" block THEN the Compiler SHALL output the `^` anchor
3. WHEN the Compiler processes an "End of Line" block THEN the Compiler SHALL output the `$` anchor
4. WHEN the Compiler processes a "Digit" block with count N THEN the Compiler SHALL output `\d{N}`
5. WHEN the Compiler processes a "Text" block with value V THEN the Compiler SHALL escape special regex characters in V and output the escaped literal
6. WHEN the Compiler processes a "Whitespace" block THEN the Compiler SHALL output `\s`
7. WHEN the Compiler processes an "Optional" block wrapping content THEN the Compiler SHALL output the content followed by `?`
8. WHEN the Compiler receives an empty block array THEN the Compiler SHALL return an empty string

### Requirement 3: Regex-to-English Explainer

**User Story:** As a user who encounters existing regex patterns, I want to paste a regex and see a human-readable explanation, so that I can understand what the pattern does.

#### Acceptance Criteria

1. WHEN a user pastes a regex string into the explainer input THEN the Tokenizer SHALL parse the string into discrete tokens
2. WHEN the Tokenizer encounters the `^` character THEN the Tokenizer SHALL produce a token mapped to "Starts with"
3. WHEN the Tokenizer encounters the `$` character THEN the Tokenizer SHALL produce a token mapped to "Ends with"
4. WHEN the Tokenizer encounters `\d` THEN the Tokenizer SHALL produce a token mapped to "Any digit (0-9)"
5. WHEN the Tokenizer encounters `\s` THEN the Tokenizer SHALL produce a token mapped to "Any whitespace character"
6. WHEN the Tokenizer encounters `[a-z]` THEN the Tokenizer SHALL produce a token mapped to "Any lowercase letter"
7. WHEN the Tokenizer encounters `[A-Z]` THEN the Tokenizer SHALL produce a token mapped to "Any uppercase letter"
8. WHEN the Tokenizer encounters `[0-9]` THEN the Tokenizer SHALL produce a token mapped to "Any digit (0-9)"
9. WHEN the Tokenizer encounters a quantifier `{N}` THEN the Tokenizer SHALL append "exactly N times" to the preceding token description
10. WHEN the Tokenizer encounters a quantifier `+` THEN the Tokenizer SHALL append "one or more times" to the preceding token description
11. WHEN the Tokenizer encounters a quantifier `*` THEN the Tokenizer SHALL append "zero or more times" to the preceding token description
12. WHEN the Tokenizer encounters a quantifier `?` THEN the Tokenizer SHALL append "optionally" to the preceding token description
13. WHEN tokens are produced THEN the RegX System SHALL render each token as a visual card displaying the human-readable description
14. WHEN the Tokenizer encounters an unrecognized pattern THEN the Tokenizer SHALL produce a token with the literal value and description "Literal: [value]"
15. WHEN the Tokenizer parses a regex THEN the RegX System SHALL provide a pretty-printer that reconstructs the regex string from tokens

### Requirement 4: Real-Time Playground

**User Story:** As a user testing my regex pattern, I want to enter sample text and see matches highlighted in real-time, so that I can validate my pattern works correctly.

#### Acceptance Criteria

1. WHEN a user enters text in the Playground test area THEN the RegX System SHALL execute the current regex pattern against the text
2. WHEN the regex pattern matches portions of the test text THEN the RegX System SHALL highlight matched portions with a distinct background color
3. WHEN the regex pattern produces no matches THEN the RegX System SHALL display the test text without highlighting
4. WHEN the regex pattern is invalid THEN the RegX System SHALL display an error indicator without crashing
5. WHEN the user modifies the regex pattern THEN the RegX System SHALL re-execute validation within 100 milliseconds

### Requirement 5: Dark Mode UI

**User Story:** As a developer using the tool, I want a dark-themed interface with high contrast, so that the tool is comfortable for extended use and fits modern developer aesthetics.

#### Acceptance Criteria

1. WHEN the application loads THEN the RegX System SHALL render with a dark mode color palette using Slate/Zinc 900 tones
2. WHEN displaying text content THEN the RegX System SHALL use high-contrast text colors for readability
3. WHEN highlighting regex matches THEN the RegX System SHALL use a semi-transparent accent color that remains visible against dark backgrounds

### Requirement 6: Application Layout

**User Story:** As a user, I want a clear layout separating block selection, pattern assembly, and testing areas, so that I can efficiently navigate the tool's features.

#### Acceptance Criteria

1. WHEN the application renders THEN the RegX System SHALL display a sidebar containing available blocks
2. WHEN the application renders THEN the RegX System SHALL display a main stage area for the Regex Strip
3. WHEN the application renders THEN the RegX System SHALL display a bottom or side panel for the Playground and preview
4. WHEN the viewport resizes THEN the RegX System SHALL maintain usable proportions for all three areas
