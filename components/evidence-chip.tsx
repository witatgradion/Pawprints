import { cn } from "@/lib/cn";

type Tone = "neutral" | "good" | "warn" | "bad" | "brand";

const toneText: Record<Tone, string> = {
  neutral: "text-ink",
  good: "text-good",
  warn: "text-warn",
  bad: "text-bad",
  brand: "text-brand",
};
const toneWhisker: Record<Tone, string> = {
  neutral: "bg-ink/30",
  good: "bg-good",
  warn: "bg-warn",
  bad: "bg-bad",
  brand: "bg-brand",
};

/* ── ConfidenceWhisker ────────────────────────────────────────────────
   The signature texture. A point estimate with a 95% margin of error
   drawn to scale: smaller samples → visibly wider whiskers. This is the
   product's thesis made literal — no number without its uncertainty. */
function ConfidenceWhisker({ percent, n, tone }: { percent: number; n: number; tone: Tone }) {
  const p = Math.min(99, Math.max(1, percent)) / 100;
  // 95% margin of error for a proportion, as a percentage of the scale.
  const margin = Math.min(0.45, 1.96 * Math.sqrt((p * (1 - p)) / Math.max(1, n)));
  const left = Math.max(0, p - margin) * 100;
  const right = Math.min(1, p + margin) * 100;
  return (
    <div className="relative mt-2 h-3 w-full" aria-hidden>
      {/* baseline */}
      <div className="absolute top-1/2 h-px w-full -translate-y-1/2 bg-line-strong" />
      {/* whisker range */}
      <div
        className={cn("absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full opacity-30", toneWhisker[tone])}
        style={{ left: `${left}%`, width: `${right - left}%` }}
      />
      {/* whisker caps */}
      <div className={cn("absolute top-1/2 h-2 w-px -translate-y-1/2", toneWhisker[tone])} style={{ left: `${left}%` }} />
      <div className={cn("absolute top-1/2 h-2 w-px -translate-y-1/2", toneWhisker[tone])} style={{ left: `${right}%` }} />
      {/* point estimate */}
      <div
        className={cn("absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card", toneWhisker[tone])}
        style={{ left: `${p * 100}%` }}
      />
    </div>
  );
}

export function EvidenceChip({
  label,
  value,
  unit,
  n,
  ci = 95,
  tone = "neutral",
  percent,
  note,
  size = "md",
}: {
  label: string;
  value: string | number;
  unit?: string;
  n: number;
  ci?: number;
  tone?: Tone;
  /** numeric percentage that drives the whisker; omit to hide the whisker */
  percent?: number;
  note?: string;
  size?: "md" | "lg";
}) {
  return (
    <div className="flex flex-col">
      <div className="text-[12px] font-medium text-ink-soft">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className={cn("tnum font-mono font-semibold tracking-tight", toneText[tone], size === "lg" ? "text-[40px] leading-none" : "text-3xl leading-none")}>
          {value}
        </span>
        {unit && <span className="text-base font-medium text-ink-faint">{unit}</span>}
      </div>
      {percent !== undefined && <ConfidenceWhisker percent={percent} n={n} tone={tone} />}
      <div className="mt-2 font-mono text-[11px] text-ink-faint">
        n={n} · {ci}% CI{note ? ` · ${note}` : ""}
      </div>
    </div>
  );
}
