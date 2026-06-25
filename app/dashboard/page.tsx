import Link from "next/link";
import { CreatorShell, Crumb } from "@/components/creator-shell";
import { Card, StatusBadge, LinkButton, Eyebrow } from "@/components/ui";
import { tests, successRate } from "@/lib/mock-data";

export default function DashboardPage() {
  const liveTests = tests.filter((t) => t.status !== "draft");
  const totalParticipants = tests.reduce((s, t) => s + t.participants, 0);
  const avg = Math.round(liveTests.reduce((s, t) => s + t.avgSuccess, 0) / liveTests.length);

  return (
    <CreatorShell breadcrumb={<Crumb items={[{ label: "Tests" }]} />}>
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Workspace</Eyebrow>
            <h1 className="font-display mt-2 text-3xl font-semibold tracking-normal">Tests</h1>
            <p className="mt-1 text-sm text-ink-soft">
              {tests.length} tests · {totalParticipants} participants · {avg}% average success
            </p>
          </div>
          <LinkButton href="/tests/new">+ New test</LinkButton>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          {tests.map((t) => (
            <Card key={t.id} className="group transition-all hover:border-brand-line hover:shadow-[0_18px_44px_-22px_rgba(255,77,141,0.45)]">
              <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <Link href={t.status === "draft" ? `/tests/${t.id}/record` : `/tests/${t.id}/results`} className="truncate text-[17px] font-semibold tracking-tight hover:text-brand">
                      {t.name}
                    </Link>
                    <StatusBadge status={t.status} />
                  </div>
                  <div className="mt-1 flex items-center gap-2 font-mono text-[12px] text-ink-faint">
                    <span className="truncate">{t.targetUrl}</span>
                    <span>·</span>
                    <span className="whitespace-nowrap">{t.scenarios.length} scenarios</span>
                    <span>·</span>
                    <span className="whitespace-nowrap">updated {t.updated}</span>
                  </div>
                </div>

                {/* inline readouts */}
                <div className="flex items-center gap-7">
                  <MiniStat label="Participants" value={t.participants || "—"} />
                  <MiniStat
                    label="Avg success"
                    value={t.participants ? `${t.avgSuccess}%` : "—"}
                    tone={t.participants ? (t.avgSuccess >= 70 ? "good" : t.avgSuccess >= 50 ? "warn" : "bad") : "muted"}
                  />
                  <div className="hidden sm:block">
                    {t.status === "draft" ? (
                      <LinkButton href={`/tests/${t.id}/record`} variant="secondary" size="sm">
                        Continue setup
                      </LinkButton>
                    ) : (
                      <LinkButton href={`/tests/${t.id}/results`} variant="secondary" size="sm">
                        View report
                      </LinkButton>
                    )}
                  </div>
                </div>
              </div>

              {/* per-scenario success bars */}
              {t.participants > 0 && (
                <div className="grid gap-px border-t border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
                  {t.scenarios.map((s) => {
                    const sr = successRate(s.metrics);
                    return (
                      <Link
                        key={s.id}
                        href={`/tests/${t.id}/results?scenario=${s.id}`}
                        className="flex flex-col gap-2 bg-card px-4 py-3 transition-colors hover:bg-paper-sunk"
                      >
                        <span className="truncate text-[12.5px] font-medium text-ink-soft" title={s.title}>
                          {s.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-sunk">
                            <div
                              className={`h-full rounded-full ${sr >= 70 ? "bg-good" : sr >= 50 ? "bg-warn" : "bg-bad"}`}
                              style={{ width: `${sr}%` }}
                            />
                          </div>
                          <span className="tnum font-mono text-[12px] font-medium">{sr}%</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </CreatorShell>
  );
}

function MiniStat({ label, value, tone = "neutral" }: { label: string; value: string | number; tone?: "neutral" | "good" | "warn" | "bad" | "muted" }) {
  const toneClass = {
    neutral: "text-ink",
    good: "text-good",
    warn: "text-warn",
    bad: "text-bad",
    muted: "text-ink-faint",
  }[tone];
  return (
    <div className="text-right">
      <div className={`tnum font-mono text-xl font-semibold ${toneClass}`}>{value}</div>
      <div className="text-[11px] text-ink-faint">{label}</div>
    </div>
  );
}
