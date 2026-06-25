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

/* ── Google "G" mark (for sign-in buttons) ───────────────────────────── */
export function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
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
