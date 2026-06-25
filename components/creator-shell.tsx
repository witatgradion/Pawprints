"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo, LinkButton } from "@/components/ui";
import { cn } from "@/lib/cn";

const nav = [
  { href: "/dashboard", label: "Tests", icon: GridIcon },
];

export function CreatorShell({ children, breadcrumb }: { children: React.ReactNode; breadcrumb?: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen">
      {/* left rail — floating panel */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 p-3 md:flex">
        <div className="flex h-full w-full flex-col rounded-3xl border border-line bg-card/80 px-4 py-5 shadow-[0_2px_4px_rgba(52,36,58,0.04),0_24px_50px_-32px_rgba(255,77,141,0.4)] backdrop-blur-md">
          <Link href="/" className="px-2">
            <Logo bob={false} />
          </Link>
          <nav className="mt-8 flex flex-col gap-1">
            {nav.map((item) => {
              const active = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href.split("?")[0]) && item.href !== "/dashboard";
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-brand-soft text-brand-dark" : "text-ink-soft hover:bg-paper-sunk hover:text-ink",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-xl border border-line bg-paper/60 px-3 py-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">Plan principle</div>
            <p className="mt-1.5 text-[12px] leading-snug text-ink-soft">
              Every claim is a number with a sample size. Never a feeling.
            </p>
          </div>
          <div className="mt-3 flex items-center gap-2 px-2">
            <span className="grid size-7 place-items-center rounded-full bg-brand text-[11px] font-semibold text-white">WP</span>
            <div className="min-w-0 flex-1 text-[12px] leading-tight">
              <div className="font-medium">Wit P.</div>
              <div className="truncate text-ink-faint">gradion.com</div>
            </div>
            <a href="/api/auth/logout" title="Sign out" aria-label="Sign out" className="grid size-7 shrink-0 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-paper-sunk hover:text-ink">
              <svg viewBox="0 0 16 16" fill="none" className="size-4">
                <path d="M6 14H3V2h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </aside>

      {/* main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-line bg-paper/85 px-5 backdrop-blur md:px-8">
          <div className="flex min-w-0 items-center gap-2 text-sm text-ink-soft">
            <Link href="/" className="md:hidden">
              <Logo className="text-[15px]" bob={false} />
            </Link>
            <span className="hidden min-w-0 truncate md:block">{breadcrumb}</span>
          </div>
          <div className="flex items-center gap-2">
            <LinkButton href="/t/acme-checkout" variant="secondary" size="sm">
              Preview as participant
            </LinkButton>
            <LinkButton href="/tests/new" size="sm">
              + New test
            </LinkButton>
          </div>
        </header>
        <main className="flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

export function Crumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <span className="flex items-center gap-2">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-ink-faint">/</span>}
          {it.href ? (
            <Link href={it.href} className="hover:text-ink">
              {it.label}
            </Link>
          ) : (
            <span className="font-medium text-ink">{it.label}</span>
          )}
        </span>
      ))}
    </span>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="1.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9.5" y="1.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1.5" y="9.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
