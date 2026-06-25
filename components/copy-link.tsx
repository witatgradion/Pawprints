"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }
  return (
    <div className="flex items-center gap-2 rounded-[var(--radius)] border border-line-strong bg-paper p-1.5 pl-3">
      <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-ink-soft">{url}</span>
      <button
        onClick={copy}
        className={cn(
          "h-8 shrink-0 rounded-md px-3 text-[13px] font-medium transition-colors",
          copied ? "bg-good-soft text-good" : "bg-brand text-white hover:bg-brand-dark",
        )}
      >
        {copied ? "Copied ✓" : "Copy link"}
      </button>
    </div>
  );
}
