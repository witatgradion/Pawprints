import { cn } from "@/lib/cn";
import { pct } from "@/lib/mock-data";

/* ── Drop-off funnel ──────────────────────────────────────────────────── */
export function Funnel({ steps, started }: { steps: { label: string; reached: number }[]; started: number }) {
  // find the largest single-step drop to flag it
  let worst = -1;
  let worstDrop = 0;
  for (let i = 1; i < steps.length; i++) {
    const drop = steps[i - 1].reached - steps[i].reached;
    if (drop > worstDrop) {
      worstDrop = drop;
      worst = i;
    }
  }
  return (
    <div className="flex flex-col gap-2.5">
      {steps.map((s, i) => {
        const w = pct(s.reached, started);
        const drop = i > 0 ? steps[i - 1].reached - s.reached : 0;
        const isWorst = i === worst;
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="w-5 shrink-0 text-right font-mono text-[11px] text-ink-faint">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[12.5px] text-ink-soft">{s.label}</span>
                <span className="tnum shrink-0 font-mono text-[12px] font-medium">{s.reached}</span>
              </div>
              <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-paper-sunk">
                <div className={cn("h-full rounded-full", isWorst ? "bg-bad" : "bg-brand")} style={{ width: `${Math.max(2, w)}%` }} />
              </div>
            </div>
            <span className={cn("w-14 shrink-0 text-right font-mono text-[11px]", drop > 0 ? (isWorst ? "text-bad" : "text-ink-faint") : "text-transparent")}>
              {drop > 0 ? `−${drop}` : "·"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Horizontal bar list (give-up reasons, expectation mismatches) ────── */
export function HBars({ items, total, tone = "ink", suffix }: { items: { label: string; count: number }[]; total: number; tone?: "ink" | "warn" | "brand"; suffix?: (n: number) => string }) {
  const max = Math.max(...items.map((i) => i.count), 1);
  const bar = { ink: "bg-ink/70", warn: "bg-warn", brand: "bg-brand" }[tone];
  return (
    <div className="flex flex-col gap-3">
      {items.map((it, i) => (
        <div key={`${it.label}-${i}`}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[12.5px] text-ink-soft">{it.label}</span>
            <span className="tnum shrink-0 font-mono text-[12px] font-medium">
              {suffix ? suffix(it.count) : it.count}
              <span className="text-ink-faint"> · {pct(it.count, total)}%</span>
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-paper-sunk">
            <div className={cn("h-full rounded-full", bar)} style={{ width: `${(it.count / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Struggle gauge ───────────────────────────────────────────────────── */
export function StruggleGauge({ index, parts }: { index: number; parts: { label: string; value: number }[] }) {
  const tone = index >= 6.5 ? "bad" : index >= 4 ? "warn" : "good";
  const toneClass = { bad: "text-bad", warn: "text-warn", good: "text-good" }[tone];
  const barClass = { bad: "bg-bad", warn: "bg-warn", good: "bg-good" }[tone];
  return (
    <div>
      <div className="flex items-end gap-3">
        <span className={cn("tnum font-mono text-4xl font-semibold leading-none", toneClass)}>{index.toFixed(1)}</span>
        <span className="pb-1 font-mono text-[12px] text-ink-faint">/ 10 composite</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper-sunk">
        <div className={cn("h-full rounded-full", barClass)} style={{ width: `${index * 10}%` }} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2.5">
        {parts.map((p) => (
          <div key={p.label} className="flex items-center justify-between border-b border-line pb-1.5">
            <span className="text-[12px] text-ink-soft">{p.label}</span>
            <span className="tnum font-mono text-[13px] font-medium">{p.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
