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

import { useEffect, useState } from "react";
import { Monitor } from "lucide-react";
import { BlockSidebar } from "@/components/block-sidebar";
import { RegexStrip } from "@/components/regex-strip";
import { RegexPreview } from "@/components/regex-preview";
import { Playground } from "@/components/playground";
import { Explainer } from "@/components/explainer";

/**
 * Detects if the user is on a mobile or tablet device (not in desktop mode).
 * Returns true only for mobile/tablet user agents without desktop mode enabled.
 */
function detectMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;

  const userAgent = navigator.userAgent.toLowerCase();

  // Check for mobile/tablet user agents
  const mobileKeywords = [
    "android",
    "webos",
    "iphone",
    "ipad",
    "ipod",
    "blackberry",
    "windows phone",
    "opera mini",
    "mobile",
  ];

  const isMobileUA = mobileKeywords.some((keyword) =>
    userAgent.includes(keyword)
  );

  // Check if "desktop mode" is likely enabled by looking for contradictions
  // Desktop mode typically changes the UA to include desktop identifiers
  const hasDesktopUA =
    userAgent.includes("windows nt") ||
    userAgent.includes("macintosh") ||
    userAgent.includes("linux x86_64");

  // If mobile UA detected but no desktop indicators, it's mobile view
  return isMobileUA && !hasDesktopUA;
}

function useIsMobileDevice(): boolean | null {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    // Run detection after mount to avoid hydration mismatch
    // This is intentional - we need to detect on client only
    requestAnimationFrame(() => {
      setIsMobile(detectMobileDevice());
    });
  }, []);

  return isMobile;
}

/**
 * Mobile/tablet warning overlay
 */
function MobileWarning() {
  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-zinc-800 border border-zinc-700">
            <Monitor className="w-12 h-12 text-emerald-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-zinc-50 mb-3">
          Reg<span className="text-emerald-400">X</span>
        </h1>
        <h2 className="text-lg font-medium text-zinc-300 mb-4">
          Desktop View Required
        </h2>
        <p className="text-zinc-400 mb-6">
          RegX Visual Regex Builder works best on desktop. Please enable{" "}
          <strong className="text-zinc-300">Desktop Mode</strong> in your
          browser settings or view on a computer.
        </p>
        <div className="text-sm text-zinc-500 bg-zinc-900 rounded-lg p-3 border border-zinc-800">
          <strong className="text-zinc-400">Tip:</strong> In most mobile
          browsers, tap the menu (⋮ or ⋯) and select &quot;Desktop site&quot; or
          &quot;Request Desktop Website&quot;
        </div>
      </div>
    </div>
  );
}


export default function Home() {
  const isMobile = useIsMobileDevice();

  // Show nothing while detecting (prevents flash)
  if (isMobile === null) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500">Loading...</div>
      </div>
    );
  }

  // Show mobile warning if on mobile/tablet without desktop mode
  if (isMobile) {
    return <MobileWarning />;
  }

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
