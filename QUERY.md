# Initial prompt

```
# Project: RegX - Deterministic Visual Regex Builder

## Goal
Build a single-purpose "Micro-Tool" that allows users to build and understand Regular Expressions without needing to know the syntax.
**Constraint:** The application logic must be 100% deterministic (JavaScript/TypeScript logic). NO external AI API calls for the regex generation or explanation.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS (Shadcn/ui aesthetic)
- **State Management:** Zustand (for global store)
- **Animations:** @formkit/auto-animate (for lightweight list transitions)
- **Language:** TypeScript

## Core Features Breakdown

### Feature A: The Visual Builder (UI -> Regex)
1.  **Block System:** Create a UI where users stack "blocks" to form a pattern.
    - Blocks: "Start of Line", "Text", "Digit", "Whitespace", "Optional", "End of Line".
2.  **Interactions:**
    - Clicking "Add Block" should smoothly animate the new block into the list.
    - Deleting a block should collapse the gap smoothly.
    - *Implementation Note:* Use `auto-animate` on the parent container.
3.  **Compiler:** A function `compileBlocksToRegex(blocks)` that maps the state array to a regex string.
    - Example: `[{type: 'START'}, {type: 'DIGIT', count: 3}]` -> `/^\d{3}/`

### Feature B: The "No-LLM" Explainer (Regex -> English)
1.  **Tokenizer:** A utility function that parses a raw regex string into tokens.
2.  **Mapper:** A dictionary that maps tokens to human descriptions.
    - `^` -> "Starts with"
    - `\d` -> "Any digit (0-9)"
    - `[a-z]` -> "Any lowercase letter"
3.  **Visualizer:** Render these descriptions as a list of "cards" so the user can read the regex flow.

### Feature C: The Playground
1.  **Input:** A text area for "Test String".
2.  **Validator:** Real-time `.test()` or `.match()` execution to highlight matches in the test string.
    - Highlight matches with a custom background color (e.g., `bg-green-500/20`).

## Design Requirements
- **Theme:** Dark Mode default (Slate/Zinc palette).
- **Layout:**
  - Sidebar: Available Blocks (Draggable or Click-to-add).
  - Main Stage: The "Regex Strip" where blocks are assembled.
  - Bottom/Side Panel: Real-time Preview & Playground.
```



# Modification Prompt

### 1.
```
it was not able to properly explain complex regex like
```

### 2.
```
even the builder should be able to build such complex regex
```

### 3.
```
I think the user should be able to drag and drop the blocks however they require, like rearrangement
```

### 4.
```
On mobile and tablet devices it must say please enable desktop mode or view in a desktop
```