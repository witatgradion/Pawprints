import { Card, LinkButton, StatusBadge } from "@/components/ui";
import { Radial, Stat } from "@/components/metric-viz";
import { fmtDuration, type StoredTest, type Summary } from "@/lib/store";

export function TestCard({ test, summary }: { test: StoredTest; summary: Summary }) {
  const hasData = summary.participants > 0 && summary.successRate !== null;
  const sr = summary.successRate ?? 0;
  const srTone = sr >= 70 ? "good" : sr >= 50 ? "warn" : "bad";
  const created = relativeTime(test.createdAt);

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h3 className="font-display truncate text-[17px] font-semibold tracking-normal">{test.name}</h3>
            <StatusBadge status={test.status} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[12px] text-ink-faint">
            <span className="truncate">{test.url}</span>
            <span>·</span>
            <span className="whitespace-nowrap">{test.scenarios.length} {test.scenarios.length === 1 ? "mission" : "missions"}</span>
            <span>·</span>
            <span className="whitespace-nowrap">created {created}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <LinkButton href={`/t/${test.id}`} variant="secondary" size="sm">
            Preview as participant
          </LinkButton>
          <LinkButton href={`/tests/${test.id}/record?url=${encodeURIComponent(test.url)}&name=${encodeURIComponent(test.name)}`} size="sm">
            Open builder
          </LinkButton>
        </div>
      </div>

      {/* metrics */}
      <div className="mt-5 border-t border-line pt-5">
        {hasData ? (
          <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
            <Radial value={summary.successRate} label="Success rate" tone={srTone} />
            <Stat value={String(summary.participants)} label="Participants" tone="brand" />
            <Stat value={summary.avgSeconds !== null ? fmtDuration(summary.avgSeconds) : "—"} label="Time on task" spark={summary.trend} />
            <Stat value={summary.avgMisclicks !== null ? String(summary.avgMisclicks) : "—"} label="Misclicks / task" tone={summary.avgMisclicks && summary.avgMisclicks > 3 ? "bad" : "ink"} />
          </div>
        ) : (
          <div className="flex items-center gap-3 text-[13px] text-ink-soft">
            <span className="grid size-8 place-items-center rounded-full bg-paper-sunk text-ink-faint">◔</span>
            <span>
              No sessions yet — <span className="font-medium text-ink">preview it as a participant</span>{" "}
              to start collecting time-on-task, success rate &amp; misclicks.
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
