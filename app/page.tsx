"use client";

/**
 * Main application page for RegX Visual Regex Builder.
 * Uses CSS Grid layout to arrange:
 * - Sidebar (left): Block selection panel
 * - Main stage (center): RegexStrip + Preview
 * - Bottom/right panel: Playground + Explainer
 *
 * @requirements 5.1 - Dark mode color palette using Slate/Zinc 900 tones
 * @requirements 5.2 - High-contrast text colors for readability
 * @requirements 6.1 - Sidebar containing available blocks
 * @requirements 6.2 - Main stage area for the Regex Strip
 * @requirements 6.3 - Bottom or side panel for Playground and preview
 * @requirements 6.4 - Maintain usable proportions on viewport resize
 */

import { BlockSidebar } from "@/components/block-sidebar";
import { RegexStrip } from "@/components/regex-strip";
import { RegexPreview } from "@/components/regex-preview";
import { Playground } from "@/components/playground";
import { Explainer } from "@/components/explainer";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] gap-0">
      {/* Header */}
      <header className="col-span-2 px-6 py-4 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-zinc-50">
            Reg<span className="text-emerald-400">X</span>
          </h1>
          <span className="text-sm text-zinc-500">Visual Regex Builder</span>
        </div>
      </header>

      {/* Sidebar - Block selection */}
      <BlockSidebar />

      {/* Main content area */}
      <main className="flex flex-col overflow-hidden bg-zinc-950">
        {/* Top section: Regex Strip + Preview */}
        <section className="flex flex-col gap-4 p-4 border-b border-zinc-800">
          <RegexStrip />
          <RegexPreview />
        </section>

        {/* Bottom section: Playground + Explainer */}
        <section className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-auto">
          <Playground />
          <Explainer />
        </section>
      </main>
    </div>
  );
}
