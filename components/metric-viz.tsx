import { cn } from "@/lib/cn";

/* A thin radial progress ring with the value in the middle. */
export function Radial({
  value,
  label,
  suffix = "%",
  tone = "brand",
  size = 76,
}: {
  value: number | null;
  label: string;
  suffix?: string;
  tone?: "brand" | "good" | "warn" | "bad";
  size?: number;
}) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = value === null ? 0 : Math.max(0, Math.min(100, value));
  const color = { brand: "var(--color-brand)", good: "var(--color-good)", warn: "var(--color-warn)", bad: "var(--color-bad)" }[tone];
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-paper-sunk)" strokeWidth={stroke} />
          {value !== null && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c - (pct / 100) * c}
            />
          )}
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="tnum font-mono text-[15px] font-semibold text-ink">
            {value === null ? "—" : value}
            {value !== null && <span className="text-[10px] text-ink-faint">{suffix}</span>}
          </span>
        </div>
      </div>
      <span className="text-[11px] font-medium text-ink-soft">{label}</span>
    </div>
  );
}

/* A compact stat: big value + label, with an optional sparkline underneath. */
export function Stat({
  value,
  label,
  spark,
  tone = "ink",
}: {
  value: string;
  label: string;
  spark?: number[];
  tone?: "ink" | "brand" | "good" | "warn" | "bad";
}) {
  const color = { ink: "var(--color-ink)", brand: "var(--color-brand)", good: "var(--color-good)", warn: "var(--color-warn)", bad: "var(--color-bad)" }[tone];
  return (
    <div className="flex flex-col">
      <span className={cn("tnum font-mono text-[22px] font-semibold leading-none")} style={{ color }}>
        {value}
      </span>
      <span className="mt-1 text-[11px] font-medium text-ink-soft">{label}</span>
      {spark && spark.length > 1 && <Sparkline data={spark} className="mt-2" />}
    </div>
  );
}

export function Sparkline({ data, className, w = 96, h = 22 }: { data: number[]; className?: string; w?: number; h?: number }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => `${(i * step).toFixed(1)},${(h - ((v - min) / span) * (h - 4) - 2).toFixed(1)}`);
  const line = `M${pts.join(" L")}`;
  const area = `${line} L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} className={className} aria-hidden>
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-brand)" stopOpacity="0.25" />
          <stop offset="1" stopColor="var(--color-brand)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark-fill)" />
      <path d={line} fill="none" stroke="var(--color-brand)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length - 1) * step} cy={h - ((data[data.length - 1] - min) / span) * (h - 4) - 2} r="2.2" fill="var(--color-brand)" />
    </svg>
  );
}
