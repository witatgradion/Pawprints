"use client";

import { useEffect, useState } from "react";
import { CreatorShell, Crumb } from "@/components/creator-shell";
import { LinkButton, Eyebrow } from "@/components/ui";
import { TestCard } from "@/components/test-card";
import { loadTests, summarize, type StoredTest, type Summary } from "@/lib/store";

export default function DashboardPage() {
  const [tests, setTests] = useState<StoredTest[] | null>(null);
  const [summaries, setSummaries] = useState<Record<string, Summary>>({});

  useEffect(() => {
    const all = loadTests();
    setTests(all);
    setSummaries(Object.fromEntries(all.map((t) => [t.id, summarize(t.id)])));
  }, []);

  return (
    <CreatorShell breadcrumb={<Crumb items={[{ label: "Usability testing" }]} />}>
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Workspace</Eyebrow>
            <h1 className="font-display mt-2 text-3xl font-semibold tracking-normal">Usability testing</h1>
            <p className="mt-1 text-sm text-ink-soft">
              {tests === null
                ? "Loading…"
                : tests.length === 0
                  ? "Run a test, watch where real participants get lost."
                  : `${tests.length} ${tests.length === 1 ? "test" : "tests"} in this workspace`}
            </p>
          </div>
          {tests && tests.length > 0 && <LinkButton href="/tests/new">+ New test</LinkButton>}
        </div>

        {tests === null ? null : tests.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-8 flex flex-col gap-4">
            {tests.map((t) => (
              <TestCard key={t.id} test={t} summary={summaries[t.id] ?? { participants: 0, successRate: null, avgSeconds: null, avgMisclicks: null, trend: [] }} />
            ))}
          </div>
        )}
      </div>
    </CreatorShell>
  );
}

function EmptyState() {
  return (
    <div className="mt-10 grid place-items-center rounded-3xl border border-dashed border-line-strong bg-card/50 px-6 py-20 text-center">
      <div className="grid size-16 place-items-center rounded-2xl bg-brand-soft text-brand">
        <svg viewBox="0 0 24 24" fill="none" className="size-8">
          <rect x="3.5" y="4.5" width="17" height="15" rx="3" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3.5 9h17M8 14h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="font-display mt-5 text-xl font-semibold tracking-normal">No testing sessions yet</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
        There&apos;s nothing running at the moment. Create a test, share the link, and watch the
        numbers come in — time on task, success rate, and misclicks.
      </p>
      <div className="mt-6">
        <LinkButton href="/tests/new">Create new test</LinkButton>
      </div>
    </div>
  );
}
