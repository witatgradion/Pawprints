import Link from "next/link";
import { cn } from "@/lib/cn";

/* ── Logo ─────────────────────────────────────────────────────────────
   Pawprints — a glossy 3D paw print: a rounded main pad with four toe beans,
   gradient body, a soft highlight, and a tinted drop shadow. Gently bobs. */
export function Logo({ className, bob = true }: { className?: string; bob?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className={cn("inline-flex", bob && "heart-bob")}>
        <PawMark className="size-[26px]" />
      </span>
      <span className="font-display leading-none">Pawprints</span>
    </span>
  );
}

export function PawMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={className}>
      <defs>
        <linearGradient id="paw-fill" x1="6" y1="5" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ff9ec1" />
          <stop offset="0.5" stopColor="#ff4d8d" />
          <stop offset="1" stopColor="#e7286e" />
        </linearGradient>
        <radialGradient id="paw-gloss" cx="0.42" cy="0.6" r="0.5">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="0.7" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id="paw-shadow" x="-30%" y="-20%" width="160%" height="170%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.6" floodColor="#ff4d8d" floodOpacity="0.35" />
        </filter>
      </defs>
      <g filter="url(#paw-shadow)" fill="url(#paw-fill)">
        <ellipse cx="16" cy="20.6" rx="7.3" ry="6" />
        <ellipse cx="8.3" cy="13.4" rx="2.7" ry="3.4" />
        <ellipse cx="13.4" cy="8.4" rx="2.6" ry="3.6" />
        <ellipse cx="18.6" cy="8.4" rx="2.6" ry="3.6" />
        <ellipse cx="23.7" cy="13.4" rx="2.7" ry="3.4" />
      </g>
      <ellipse cx="16" cy="20.6" rx="7.3" ry="6" fill="url(#paw-gloss)" />
    </svg>
  );
}

/* ── Button ─────────────────────────────────────────────────────────── */
type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius)] font-medium leading-none transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none cursor-pointer whitespace-nowrap active:scale-[0.98]";
const btnSize = { sm: "h-8 px-3 text-[13px]", md: "h-10 px-4 text-sm" };
const btnVariant = {
  primary:
    "bg-brand text-white shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_8px_20px_-8px_rgba(255,77,141,0.7)] hover:bg-brand-dark hover:-translate-y-px hover:shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_12px_26px_-8px_rgba(255,77,141,0.85)]",
  secondary: "bg-card text-ink border border-line-strong hover:bg-paper-sunk hover:border-brand-line",
  ghost: "text-ink-soft hover:bg-paper-sunk hover:text-ink",
  danger: "bg-bad-soft text-bad hover:bg-bad hover:text-white",
};

export function Button({ variant = "primary", size = "md", className, children, ...rest }: ButtonProps) {
  return (
    <button className={cn(btnBase, btnSize[size], btnVariant[variant], className)} {...rest}>
      {/* the rounded font is ascent-heavy; nudge the label to optical center */}
      <span className="inline-flex translate-y-px">{children}</span>
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn(btnBase, btnSize[size], btnVariant[variant ?? "primary"], className)}>
      <span className="inline-flex translate-y-px">{children}</span>
    </Link>
  );
}

/* ── Card ─────────────────────────────────────────────────────────────── */
export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn("card-soft rounded-[18px] border border-line bg-card", className)}
    >
      {children}
    </div>
  );
}

/* ── Eyebrow / section label ─────────────────────────────────────────── */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint", className)}>
      {children}
    </div>
  );
}

/* ── Status badge ─────────────────────────────────────────────────────── */
const statusStyles: Record<string, string> = {
  live: "bg-good-soft text-good",
  draft: "bg-paper-sunk text-ink-soft",
  complete: "bg-brand-soft text-brand-dark",
};
export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize",
        statusStyles[status] ?? "bg-paper-sunk text-ink-soft",
      )}
    >
      {status === "live" && <span className="size-1.5 rounded-full bg-good animate-pulse" />}
      {status}
    </span>
  );
}

/* ── Severity tag (for recommendations) ──────────────────────────────── */
const sevStyles: Record<string, string> = {
  critical: "bg-bad text-white",
  high: "bg-bad-soft text-bad",
  medium: "bg-warn-soft text-warn",
  low: "bg-paper-sunk text-ink-soft",
};
export function SeverityTag({ severity }: { severity: string }) {
  return (
    <span className={cn("rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider", sevStyles[severity])}>
      {severity}
    </span>
  );
}
