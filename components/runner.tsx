"use client";

import { useState } from "react";
import Link from "next/link";
import { MockSite, type SitePage } from "@/components/mock-site";
import { Logo } from "@/components/ui";
import { nextPage, happyPath } from "@/lib/site-nav";
import { getTest, tests } from "@/lib/mock-data";
import { cn } from "@/lib/cn";

type Phase = "welcome" | "intro" | "task" | "postq" | "thanks";

const giveUpReasons = ["Couldn't find it", "Didn't trust it", "Too many steps", "Thought I was done", "Something else"];

export function Runner({ testId }: { testId: string }) {
  const test = getTest(testId) ?? tests[0];
  const scenarios = test.scenarios;

  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("welcome");
  const [name, setName] = useState("");
  const [page, setPage] = useState<SitePage>("listing");
  const [progress, setProgress] = useState(0); // furthest happy-path index reached
  const [misclicks, setMisclicks] = useState(0); // clicks off the expected path
  const [taskStart, setTaskStart] = useState(0); // ms timestamp the task began
  const [outcome, setOutcome] = useState<"completed" | "gave_up" | null>(null);
  const [reasonOpen, setReasonOpen] = useState(false);
  // captured metrics per task: time on task, success, misclicks
  const [captured, setCaptured] = useState<{ task: string; outcome: "completed" | "gave_up"; seconds: number; misclicks: number }[]>([]);

  const scenario = scenarios[idx];
  const tracked = scenario.id.toLowerCase().includes("checkout");
  const totalSteps = happyPath.length;

  function resetTask() {
    setPage("listing");
    setProgress(0);
    setMisclicks(0);
    setOutcome(null);
    setReasonOpen(false);
  }

  function startTask() {
    resetTask();
    setTaskStart(Date.now());
    setPhase("task");
  }

  function onHit(id: string) {
    const np = nextPage(page, id);
    if (tracked) {
      const expected = happyPath[progress];
      if (expected && id === expected.id) {
        const newProg = progress + 1;
        setProgress(newProg);
        if (expected.final || np === "done") {
          setPage("done");
          finish("completed");
          return;
        }
      } else {
        setMisclicks((m) => m + 1); // off-path click
      }
    }
    setPage(np);
    if (np === "done") finish("completed");
  }

  function onMiss() {
    setMisclicks((m) => m + 1); // clicked a non-interactive area = off-path
  }

  function finish(o: "completed" | "gave_up") {
    const seconds = Math.max(1, Math.round((Date.now() - taskStart) / 1000));
    setCaptured((c) => [...c, { task: scenario.title, outcome: o, seconds, misclicks }]);
    setOutcome(o);
    setPhase("postq");
  }

  function nextScenario() {
    if (idx + 1 < scenarios.length) {
      setIdx(idx + 1);
      resetTask();
      setPhase("intro");
    } else {
      setPhase("thanks");
    }
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-paper-sunk">
      {/* the proxied site fills the viewport */}
      <div className="absolute inset-0">
        <MockSite page={page} onHit={(id) => onHit(id)} onMiss={onMiss} />
      </div>

      {/* tiny "powered by" so the participant knows the frame */}
      <div className="pointer-events-none absolute left-3 top-3 z-30 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-medium text-stone-600 shadow-sm backdrop-blur">
        Pawprints test · responses are anonymous
      </div>

      {/* WELCOME — statement + name + start */}
      {phase === "welcome" && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-paper/80 px-4 backdrop-blur-sm">
          <div className="w-[min(94vw,460px)] rounded-2xl border border-line bg-card p-7 text-center shadow-xl">
            <div className="flex justify-center"><Logo bob={false} /></div>
            <h2 className="font-display mt-5 text-xl font-semibold tracking-normal">Welcome 👋</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Thanks for helping out! You&apos;ll get a few short tasks on a live site. Just do them as you
              naturally would — there are no wrong answers.
            </p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="mt-5 h-11 w-full rounded-[var(--radius)] border border-line-strong bg-paper px-3.5 text-sm outline-none focus:border-brand placeholder:text-ink-faint"
            />
            <button
              disabled={!name.trim()}
              onClick={() => setPhase("intro")}
              className="mt-3 h-11 w-full rounded-[var(--radius)] bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-40"
            >
              Start
            </button>
          </div>
        </div>
      )}

      {/* TASK INTRO — preview the task, then start */}
      {phase === "intro" && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-paper/80 px-4 backdrop-blur-sm">
          <div className="w-[min(94vw,480px)] rounded-2xl border border-line bg-card p-7 text-center shadow-xl">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
              Task {idx + 1} of {scenarios.length}
            </span>
            <h2 className="font-display mt-2 text-[22px] font-semibold leading-snug tracking-normal">{scenario.title}</h2>
            {scenario.instruction && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{scenario.instruction}</p>}
            <button
              onClick={startTask}
              className="mt-6 h-11 w-full rounded-[var(--radius)] bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Start
            </button>
          </div>
        </div>
      )}

      {/* TASK PHASE — floating card, give-up only */}
      {phase === "task" && (
        <div className="absolute bottom-5 left-1/2 z-30 w-[min(92vw,520px)] -translate-x-1/2">
          <div className="mx-auto mb-2 w-fit rounded-full bg-card/90 px-3 py-1 text-[11px] font-medium text-ink-soft shadow-sm ring-1 ring-line backdrop-blur">
            Finish this task and you&apos;ll move on to the next one →
          </div>
          <div className="rounded-2xl border border-line-strong bg-card/95 p-4 shadow-[0_24px_60px_-22px_rgba(52,36,58,0.4)] backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
                Task {idx + 1} of {scenarios.length}
              </span>
              {tracked && (
                <div className="flex items-center gap-1" aria-label={`Progress ${progress} of ${totalSteps}`}>
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <span key={i} className={cn("h-1.5 w-4 rounded-full", i < progress ? "bg-brand" : "bg-line-strong")} />
                  ))}
                </div>
              )}
            </div>

            <p className="mt-2 text-[15px] font-semibold leading-snug">{scenario.title}</p>
            {scenario.instruction && <p className="mt-0.5 text-[13px] text-ink-soft">{scenario.instruction}</p>}

            <div className="mt-3.5 flex items-center">
              <button
                onClick={() => setReasonOpen(true)}
                className="rounded-lg border border-line-strong px-3 py-2 text-[13px] font-medium text-ink-soft transition-colors hover:border-brand hover:text-brand"
              >
                Give up
              </button>
            </div>
          </div>

          {/* give-up reason picker */}
          {reasonOpen && (
            <div className="mt-2 rounded-2xl border border-line bg-card p-4 shadow-lg">
              <div className="text-[13px] font-medium">What stopped you?</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {giveUpReasons.map((r) => (
                  <button
                    key={r}
                    onClick={() => finish("gave_up")}
                    className="rounded-full border border-line-strong px-3 py-1.5 text-[12.5px] text-ink-soft hover:border-brand hover:text-brand"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* POST-TASK QUESTIONS */}
      {phase === "postq" && (
        <PostTask
          outcome={outcome!}
          onSubmit={nextScenario}
          last={idx + 1 >= scenarios.length}
        />
      )}

      {/* THANK YOU */}
      {phase === "thanks" && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-paper/80 backdrop-blur-sm">
          <div className="w-[min(92vw,440px)] rounded-2xl border border-line bg-card p-7 text-center shadow-xl">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-good-soft text-xl text-good">✓</div>
            <h2 className="font-display mt-4 text-xl font-semibold tracking-normal">That&apos;s everything — thank you</h2>
            <p className="mt-1.5 text-sm text-ink-soft">
              Your responses are anonymous and go straight to the team. You can close this tab.
            </p>
            {captured.length > 0 && (
              <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl border border-line bg-paper/50 p-3">
                <Recap label="Success" value={`${captured.filter((c) => c.outcome === "completed").length}/${captured.length}`} />
                <Recap label="Avg time" value={`${Math.round(captured.reduce((s, c) => s + c.seconds, 0) / captured.length)}s`} />
                <Recap label="Misclicks" value={String(captured.reduce((s, c) => s + c.misclicks, 0))} />
              </div>
            )}
            <Link href="/dashboard" className="mt-5 inline-flex h-10 items-center justify-center rounded-[var(--radius)] bg-brand px-4 text-sm font-medium text-white hover:bg-brand-dark">
              See the creator&apos;s report →
            </Link>
            <div className="mt-5 flex items-center justify-center">
              <Logo className="text-[13px] text-ink-faint" bob={false} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Recap({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="tnum font-mono text-lg font-semibold text-ink">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-ink-faint">{label}</div>
    </div>
  );
}

function PostTask({ outcome, onSubmit, last }: { outcome: "completed" | "gave_up"; onSubmit: () => void; last: boolean }) {
  const [seq, setSeq] = useState<number | null>(null);
  const [conf, setConf] = useState<string | null>(null);
  const ready = seq !== null && conf !== null;

  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-paper/80 px-4 backdrop-blur-sm">
      <div className="w-[min(94vw,500px)] rounded-2xl border border-line bg-card p-6 shadow-xl">
        <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-medium", outcome === "completed" ? "bg-good-soft text-good" : "bg-paper-sunk text-ink-soft")}>
          {outcome === "completed" ? "Task marked complete" : "Task ended"}
        </div>

        {/* SEQ */}
        <div className="mt-5">
          <div className="text-[14px] font-medium">Overall, how easy or difficult was that task?</div>
          <div className="mt-3 flex items-center justify-between gap-1.5">
            {Array.from({ length: 7 }).map((_, i) => {
              const v = i + 1;
              return (
                <button
                  key={v}
                  onClick={() => setSeq(v)}
                  className={cn(
                    "tnum h-10 flex-1 rounded-lg border font-mono text-sm font-semibold transition-colors",
                    seq === v ? "border-brand bg-brand text-white" : "border-line-strong bg-paper hover:border-brand",
                  )}
                >
                  {v}
                </button>
              );
            })}
          </div>
          <div className="mt-1.5 flex justify-between font-mono text-[11px] text-ink-faint">
            <span>1 · very difficult</span>
            <span>7 · very easy</span>
          </div>
        </div>

        {/* Confidence */}
        <div className="mt-6">
          <div className="text-[14px] font-medium">How sure are you that you completed it correctly?</div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {["Not sure", "Fairly sure", "Certain"].map((c) => (
              <button
                key={c}
                onClick={() => setConf(c)}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-[13px] font-medium transition-colors",
                  conf === c ? "border-brand bg-brand-soft text-brand-dark" : "border-line-strong bg-paper hover:border-brand",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <button
          disabled={!ready}
          onClick={onSubmit}
          className="mt-7 h-11 w-full rounded-[var(--radius)] bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-40"
        >
          {last ? "Finish" : "Next task →"}
        </button>
      </div>
    </div>
  );
}
