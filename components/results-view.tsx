"use client";

import { useState } from "react";
import { Card, Eyebrow, SeverityTag, LinkButton } from "@/components/ui";
import { EvidenceChip } from "@/components/evidence-chip";
import { Heatmap } from "@/components/heatmap";
import { Funnel, HBars, StruggleGauge } from "@/components/charts";
import { cn } from "@/lib/cn";
import { pct, successRate, falseSuccessRate, type Test } from "@/lib/mock-data";

export function ResultsView({ test, initialScenario }: { test: Test; initialScenario?: string }) {
  const [scenarioId, setScenarioId] = useState(
    initialScenario && test.scenarios.some((s) => s.id === initialScenario) ? initialScenario : test.scenarios[0].id,
  );
  const scenario = test.scenarios.find((s) => s.id === scenarioId) ?? test.scenarios[0];
  const m = scenario.metrics;

  const sr = successRate(m);
  const directPct = pct(m.directSuccess, m.started);
  const indirectPct = pct(m.indirectSuccess, m.started);
  const firstClickPct = pct(m.firstClickCorrect, m.started);
  const giveUpPct = pct(m.gaveUp, m.started);
  const fsr = falseSuccessRate(m);
  const seqPct = Math.round((m.seqMean / 7) * 100);

  return (
    <div className="mx-auto max-w-6xl">
      {/* title row */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Report · {test.targetUrl.replace("https://", "")}</Eyebrow>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-normal">{test.name}</h1>
        </div>
        <LinkButton href={`/tests/${test.id}/share`} variant="secondary" size="sm">
          Share &amp; collect more
        </LinkButton>
      </div>

      {/* scenario tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {test.scenarios.map((s) => {
          const active = s.id === scenarioId;
          const ssr = successRate(s.metrics);
          return (
            <button
              key={s.id}
              onClick={() => setScenarioId(s.id)}
              className={cn(
                "group flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left transition-colors",
                active ? "border-brand bg-brand text-white shadow-[0_6px_20px_-8px_rgba(255,77,141,0.65)]" : "border-line bg-card hover:border-brand-line",
              )}
            >
              <span className={cn("inline-block size-2 rounded-full", ssr >= 70 ? "bg-good" : ssr >= 50 ? "bg-warn" : "bg-bad")} />
              <span className="max-w-[170px] truncate text-[13px] font-medium">{s.title}</span>
              <span className={cn("tnum font-mono text-[12px]", active ? "text-white/70" : "text-ink-faint")}>{ssr}%</span>
            </button>
          );
        })}
      </div>

      {/* headline evidence chips */}
      <Card className="mt-4 p-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-3 lg:grid-cols-6">
          <EvidenceChip label="Success rate" value={sr} unit="%" percent={sr} n={m.started} tone={sr >= 70 ? "good" : sr >= 50 ? "warn" : "bad"} />
          <EvidenceChip label="Direct success" value={directPct} unit="%" percent={directPct} n={m.started} tone={directPct >= 60 ? "good" : directPct >= 40 ? "warn" : "bad"} note="happy path" />
          <EvidenceChip label="Indirect success" value={indirectPct} unit="%" percent={indirectPct} n={m.started} tone="neutral" note="via detours" />
          <EvidenceChip label="First-click accuracy" value={firstClickPct} unit="%" percent={firstClickPct} n={m.started} tone={firstClickPct >= 65 ? "good" : firstClickPct >= 50 ? "warn" : "bad"} />
          <EvidenceChip label="SEQ — ease" value={m.seqMean.toFixed(1)} unit="/7" percent={seqPct} n={m.seqN} tone={m.seqMean >= 5.5 ? "good" : m.seqMean >= 4 ? "warn" : "bad"} />
          <EvidenceChip label="False success" value={fsr} unit="%" percent={fsr} n={m.completed} tone={fsr <= 10 ? "good" : fsr <= 20 ? "warn" : "bad"} note="of completers" />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-line pt-4 font-mono text-[12px] text-ink-faint">
          <span>Give-up rate <span className="font-semibold text-bad">{giveUpPct}%</span></span>
          <span>Median time on task <span className="font-semibold text-ink">{m.medianTimeOnTask}</span></span>
          <span>Time to first click <span className="font-semibold text-ink">{m.medianTimeToFirstClick}</span></span>
          <span>Sample <span className="font-semibold text-ink">n={m.started}</span></span>
        </div>
      </Card>

      {/* two-column body */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Drop-off funnel" eyebrow="Per happy-path step" note="biggest drop flagged">
          <Funnel steps={m.funnel} started={m.started} />
        </Panel>

        <Panel title="Misclick heatmap" eyebrow="Cart page · aggregated clicks">
          <Heatmap points={m.heatmap} />
        </Panel>

        <Panel title="Struggle index" eyebrow="Rage · dead · hesitation · loops">
          <StruggleGauge
            index={m.struggle.index}
            parts={[
              { label: "Rage clicks", value: m.struggle.rageClicks },
              { label: "Dead clicks", value: m.struggle.deadClicks },
              { label: "Hesitation events", value: m.struggle.hesitation },
              { label: "Back-and-forth loops", value: m.struggle.backAndForth },
            ]}
          />
        </Panel>

        <Panel title="Expectation mismatches" eyebrow="What users expected to be clickable" note="design signal, not noise">
          <HBars items={m.expectationMismatches} total={m.started} tone="brand" />
        </Panel>

        <Panel title="Give-up reasons" eyebrow={`${m.gaveUp} participants gave up`}>
          <HBars items={m.giveUpReasons.map((r) => ({ label: r.reason, count: r.count }))} total={m.gaveUp} tone="warn" />
        </Panel>

        <Panel title="Confidence vs outcome" eyebrow="False-success detection">
          <ConfidenceBreakdown
            completed={m.completed}
            falseSuccess={m.falseSuccess}
            lowConf={m.confidenceLow}
          />
        </Panel>
      </div>

      {/* AI recommendations — the payoff */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <Eyebrow>Generated by Claude · ranked by impact × frequency</Eyebrow>
            <h2 className="font-display mt-1.5 text-xl font-semibold tracking-normal">What to fix first</h2>
          </div>
          <span className="hidden font-mono text-[12px] text-ink-faint sm:block">{m.recommendations.length} issues</span>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {m.recommendations.map((r, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="flex flex-col gap-4 p-5 sm:flex-row">
                <div className="flex shrink-0 flex-row items-center gap-3 sm:w-20 sm:flex-col sm:items-start">
                  <span className="tnum font-mono text-3xl font-semibold text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
                  <SeverityTag severity={r.severity} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[16px] font-semibold tracking-tight">{r.title}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">{r.finding}</p>
                  <div className="mt-3 flex items-start gap-2 rounded-lg bg-brand-soft/50 px-3 py-2.5">
                    <span className="mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-brand">Fix</span>
                    <p className="text-[13px] font-medium text-ink">{r.fix}</p>
                  </div>
                  <div className="mt-3 font-mono text-[11px] text-ink-faint">{r.affectedStep}</div>
                </div>
                <div className="flex shrink-0 flex-row gap-6 sm:flex-col sm:items-end sm:text-right">
                  <div>
                    <div className="tnum font-mono text-2xl font-semibold text-brand">{r.impact}</div>
                    <div className="text-[11px] text-ink-faint">impact</div>
                  </div>
                  <div>
                    <div className="tnum font-mono text-2xl font-semibold">{r.frequency}%</div>
                    <div className="text-[11px] text-ink-faint">affected</div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* stakeholder summary */}
      <Card className="mt-6 border-brand-line bg-brand-soft/40 p-6">
        <Eyebrow className="text-brand">Stakeholder summary · forward this</Eyebrow>
        <p className="mt-2 max-w-3xl text-[15px] leading-relaxed">
          On <span className="font-semibold">{scenario.title.toLowerCase()}</span>, {sr}% of {m.started}{" "}
          participants succeeded, but only {directPct}% via the intended path. The dominant failure is the
          cart icon being mistaken for checkout ({m.expectationMismatches[0]?.count ?? 0} of {m.started}{" "}
          participants), driving a {giveUpPct}% give-up rate and an SEQ of {m.seqMean.toFixed(1)}/7. Fixing the
          mini-cart checkout CTA is projected to recover the largest share of lost completions.
        </p>
      </Card>
    </div>
  );
}

function Panel({ title, eyebrow, note, children }: { title: string; eyebrow: string; note?: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h3 className="mt-1 text-[15px] font-semibold tracking-tight">{title}</h3>
        </div>
        {note && <span className="rounded-full bg-paper-sunk px-2 py-0.5 font-mono text-[10px] text-ink-faint">{note}</span>}
      </div>
      <div className="mt-4">{children}</div>
    </Card>
  );
}

function ConfidenceBreakdown({ completed, falseSuccess, lowConf }: { completed: number; falseSuccess: number; lowConf: number }) {
  const trueSuccess = Math.max(0, completed - falseSuccess - lowConf);
  const rows = [
    { label: "Confident & correct", value: trueSuccess, tone: "bg-good" },
    { label: "Low-confidence success", value: lowConf, tone: "bg-warn" },
    { label: "Confident but wrong (false success)", value: falseSuccess, tone: "bg-bad" },
  ];
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-paper-sunk">
        {rows.map((r) => (
          <div key={r.label} className={r.tone} style={{ width: `${pct(r.value, completed)}%` }} />
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-2.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[12.5px] text-ink-soft">
              <span className={cn("size-2.5 rounded-full", r.tone)} /> {r.label}
            </span>
            <span className="tnum font-mono text-[12px] font-medium">
              {r.value} <span className="text-ink-faint">· {pct(r.value, completed)}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
