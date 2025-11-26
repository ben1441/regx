# RegX - Visual Regex Builder

A deterministic visual regex builder that lets you construct and understand Regular Expressions without knowing regex syntax. Build patterns with blocks, test them in real-time, and get human-readable explanations — all with zero AI dependencies.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Block-Based Builder** — Drag and stack visual blocks to create regex patterns without memorizing syntax
- **Regex-to-English Explainer** — Paste any regex and get a human-readable breakdown of what it does
- **Real-Time Playground** — Test patterns against sample text with instant match highlighting
- **100% Deterministic** — Pure TypeScript logic with no external AI/LLM dependencies

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **State Management**: Zustand
- **Styling**: Tailwind CSS (dark mode)
- **Testing**: Vitest + fast-check (property-based testing)
- **Animations**: @formkit/auto-animate
- **Icons**: lucide-react

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/ben1441/regx.git
cd regx

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests with Vitest |

## Project Structure

```
app/
├── layout.tsx          # Root layout with dark theme
├── page.tsx            # Main application page
├── globals.css         # Tailwind base styles

lib/
├── compiler.ts         # Block → Regex compiler
├── tokenizer.ts        # Regex → Token parser
├── pretty-printer.ts   # Token → Regex reconstructor
├── matcher.ts          # Pattern matching engine
├── types.ts            # TypeScript interfaces

store/
├── regex-store.ts      # Zustand state management

components/
├── block-sidebar.tsx   # Available blocks panel
├── regex-strip.tsx     # Block assembly canvas
├── block-card.tsx      # Individual block component
├── playground.tsx      # Test area with highlighting
├── explainer.tsx       # Regex explanation panel
├── regex-preview.tsx   # Compiled regex display
```

## Supported Block Types

| Block | Output | Description |
|-------|--------|-------------|
| Start of Line | `^` | Matches beginning of string |
| End of Line | `$` | Matches end of string |
| Text | `escaped literal` | Matches exact text (special chars escaped) |
| Digit | `\d{N}` | Matches N digits |
| Whitespace | `\s` | Matches any whitespace |
| Optional | `C?` | Makes content optional |
| Word | `\w` | Matches word characters |
| Any Char | `.` | Matches any character |
| Character Class | `[chars]` | Matches characters in set |
| Group | `(pattern)` | Groups patterns together |

## License

MIT
