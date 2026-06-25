"use client";

import { useEffect, useRef, useState } from "react";
import { MockSite, type SitePage } from "@/components/mock-site";
import { nextPage } from "@/lib/site-nav";
import { getStoredTest, upsertTest } from "@/lib/store";
import { cn } from "@/lib/cn";

const START: SitePage = "listing";
const screenName: Record<SitePage, string> = {
  listing: "Backpacks", product: "Product", cart: "Cart", checkout: "Checkout", done: "Confirmation",
};

type Path = { id: string; screens: SitePage[] };
type Mission = { id: string; task: string; description: string; paths: Path[] };

let uid = 1;
const nid = (p: string) => `${p}${uid++}`;
const newPath = (): Path => ({ id: nid("p"), screens: [START] });
const newMission = (): Mission => ({ id: nid("m"), task: "", description: "", paths: [newPath()] });

export function Recorder({ testId, name = "", url = "", host = "acme.store" }: { testId?: string; name?: string; url?: string; host?: string }) {
  const [blocks, setBlocks] = useState<Mission[]>(() => [newMission()]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activePathId, setActivePathId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addPos, setAddPos] = useState<{ top: number; left: number } | null>(null);
  // welcome / thank-you statements shown to the participant before & after the test
  const [welcomeText, setWelcomeText] = useState("");
  const [thankYouText, setThankYouText] = useState("");
  // preview is locked to the 1440×1024 aspect; this is its scale. Drag the handle
  // (or the collapse chevron) to resize it. The left panel auto-collapses when enlarged.
  const [previewScale, setPreviewScale] = useState(0.65);
  const collapsed = previewScale >= 0.78;

  const selKey = selectedId ?? blocks[0].id;
  const isWelcome = selKey === "welcome";
  const isThankYou = selKey === "thankyou";
  const isSystem = isWelcome || isThankYou;
  const mission = isSystem ? null : blocks.find((b) => b.id === selKey) ?? blocks[0];
  const activePath = mission ? mission.paths.find((p) => p.id === activePathId) ?? mission.paths[mission.paths.length - 1] : null;
  const page = activePath ? activePath.screens[activePath.screens.length - 1] : START;

  // auto-save the test (and its missions) to the local store as it's built
  useEffect(() => {
    if (!testId) return;
    const existing = getStoredTest(testId);
    upsertTest({
      id: testId,
      name: name || existing?.name || "Untitled test",
      url: url || existing?.url || "",
      status: "live",
      createdAt: existing?.createdAt ?? Date.now(),
      scenarios: blocks.map((b) => ({ id: b.id, title: b.task.trim() || "Untitled mission", instruction: b.description.trim() || undefined })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks, testId, name, url]);

  function patchMission(id: string, patch: Partial<Mission>) {
    setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }
  function patchPath(missionId: string, pathId: string, fn: (p: Path) => Path) {
    setBlocks((bs) =>
      bs.map((b) => (b.id !== missionId ? b : { ...b, paths: b.paths.map((p) => (p.id === pathId ? fn(p) : p)) })),
    );
  }

  function onHit(id: string) {
    if (!mission || !activePath) return;
    const np = nextPage(page, id);
    if (np !== page) {
      patchPath(mission.id, activePath.id, (p) => ({ ...p, screens: [...p.screens, np] }));
    }
  }
  function removeScreen(pathId: string, idx: number) {
    if (idx === 0 || !mission) return; // starting screen stays
    patchPath(mission.id, pathId, (p) => ({ ...p, screens: p.screens.filter((_, i) => i !== idx) }));
  }
  function addPath() {
    if (!mission) return;
    const p = newPath();
    setBlocks((bs) => bs.map((b) => (b.id !== mission.id ? b : { ...b, paths: [...b.paths, p] })));
    setActivePathId(p.id);
  }
  function selectBlock(id: string) {
    setSelectedId(id);
    setActivePathId(null);
    setAddOpen(false);
  }
  function addMission() {
    const m = newMission();
    setBlocks((bs) => [...bs, m]);
    setSelectedId(m.id);
    setActivePathId(null);
    setAddOpen(false);
  }
  function deleteBlock(id: string) {
    if (blocks.length <= 1) return; // keep at least one mission
    const remaining = blocks.filter((b) => b.id !== id);
    setBlocks(remaining);
    setSelectedId(remaining[0].id);
    setActivePathId(null);
  }

  return (
    <div
      className={cn(
        "grid h-[calc(100vh-3.5rem)] min-w-0 grid-cols-1 overflow-hidden",
        collapsed ? "lg:grid-cols-[52px_minmax(0,1fr)_minmax(0,1.6fr)]" : "lg:grid-cols-[252px_minmax(0,1fr)_minmax(0,1.6fr)]",
      )}
    >
      {/* ── LEFT · Blocks ─────────────────────────────────────────── */}
      <aside className={cn("order-2 flex min-h-0 flex-col overflow-auto border-t border-line bg-paper/40 py-4 lg:order-1 lg:border-r lg:border-t-0", collapsed ? "items-center px-2" : "px-3")}>
        {collapsed ? (
          <button
            onClick={() => setPreviewScale(0.65)}
            title="Expand blocks"
            aria-label="Expand blocks"
            className="grid size-9 place-items-center rounded-xl border border-line bg-card text-ink-soft transition-colors hover:border-brand hover:text-brand"
          >
            <Chevron dir="right" />
          </button>
        ) : (
          <>
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">Blocks</span>
              <button
                onClick={() => setPreviewScale(0.86)}
                title="Collapse to enlarge preview"
                aria-label="Collapse blocks"
                className="grid size-7 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-paper-sunk hover:text-ink"
              >
                <Chevron dir="left" />
              </button>
            </div>
            <SystemBlock label="Welcome Screen" icon="enter" active={isWelcome} onClick={() => selectBlock("welcome")} />

        <div className="mt-3 flex flex-col gap-2">
          {blocks.map((b) => {
            const active = !isSystem && b.id === selKey;
            return (
              <div
                key={b.id}
                role="button"
                tabIndex={0}
                onClick={() => selectBlock(b.id)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && selectBlock(b.id)}
                className={cn(
                  "group flex cursor-pointer items-center gap-2.5 rounded-2xl border bg-card p-3 text-left transition-colors",
                  active ? "border-brand ring-2 ring-brand/15" : "border-line hover:border-brand-line",
                )}
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                  <MissionGlyph className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold">{b.task.trim() || "Block title"}</div>
                  <div className="text-[11px] text-ink-faint">Mission</div>
                </div>
                {blocks.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteBlock(b.id); }}
                    aria-label="Delete block"
                    title="Delete block"
                    className="grid size-7 shrink-0 place-items-center rounded-lg text-ink-faint opacity-0 transition hover:bg-bad-soft hover:text-bad focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <TrashGlyph className="size-4" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Add block */}
          <button
            onClick={(e) => {
              if (addOpen) return setAddOpen(false);
              const r = e.currentTarget.getBoundingClientRect();
              setAddPos({ top: r.top, left: r.right + 10 });
              setAddOpen(true);
            }}
            className={cn(
              "flex items-center gap-2.5 rounded-2xl border border-dashed px-3 py-3 text-left transition-colors",
              addOpen ? "border-brand bg-brand-soft/40" : "border-line-strong hover:border-brand hover:bg-brand-soft/20",
            )}
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-full border border-current text-brand">+</span>
            <div>
              <div className="text-[13px] font-semibold text-ink">Add block</div>
              <div className="text-[11px] text-ink-faint">Mission, question, rating…</div>
            </div>
          </button>
        </div>

        <div className="mt-3">
          <SystemBlock label="Thank you Screen" icon="flag" active={isThankYou} onClick={() => selectBlock("thankyou")} />
        </div>
          </>
        )}
      </aside>

      {/* ── CENTER · Mission editor ───────────────────────────────── */}
      <section className="order-3 flex min-h-0 flex-col overflow-auto bg-card px-6 py-5 lg:order-2">
        <div className="mx-auto w-full max-w-2xl">
          <div className="flex items-center gap-2">
            <span className={cn("grid size-7 place-items-center rounded-lg", isSystem ? "bg-ink text-white" : "bg-brand-soft text-brand")}>
              {isWelcome ? <EnterGlyph className="size-3.5" /> : isThankYou ? <FlagGlyph className="size-3.5" /> : <MissionGlyph className="size-4" />}
            </span>
            <h2 className="font-display text-lg font-semibold tracking-normal">
              {isWelcome ? "Welcome Screen" : isThankYou ? "Thank you Screen" : "Mission"}
            </h2>
          </div>

          {isSystem ? (
            <div className="mt-6">
              <Label>Description</Label>
              <p className="mt-0.5 text-[12px] text-ink-soft">
                {isWelcome
                  ? "The statement participants see before they start the test."
                  : "The statement participants see after they finish the test."}
              </p>
              <textarea
                value={isWelcome ? welcomeText : thankYouText}
                onChange={(e) => (isWelcome ? setWelcomeText(e.target.value) : setThankYouText(e.target.value))}
                placeholder={
                  isWelcome
                    ? "e.g. Thanks for helping out! Complete each task as you naturally would — there are no wrong answers."
                    : "e.g. That's everything — thank you for your time! Your responses go straight to the team."
                }
                rows={5}
                className="mt-2 w-full resize-none rounded-[var(--radius)] border border-line-strong bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-brand placeholder:text-ink-faint"
              />
            </div>
          ) : (
          <>
          {/* Task */}
          <div className="mt-6">
            <Label required>Task</Label>
            <input
              value={mission!.task}
              onChange={(e) => patchMission(mission!.id, { task: e.target.value })}
              placeholder="Write a short sentence that summarizes the task"
              className="mt-2 h-11 w-full rounded-[var(--radius)] border border-line-strong bg-paper px-3.5 text-sm outline-none focus:border-brand placeholder:text-ink-faint"
            />
          </div>

          {/* Description */}
          <div className="mt-5">
            <Label required>Description</Label>
            <textarea
              value={mission!.description}
              onChange={(e) => patchMission(mission!.id, { description: e.target.value })}
              placeholder="Give testers details to complete the mission"
              rows={2}
              className="mt-2 w-full resize-none rounded-[var(--radius)] border border-line-strong bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-brand placeholder:text-ink-faint"
            />
          </div>

          {/* Expected paths */}
          <div className="mt-6">
            <Label required>Expected path(s)</Label>
            <p className="mt-0.5 text-[12px] text-ink-soft">Set the path(s) you expect testers to take to complete this mission.</p>

            <div className="mt-3 flex flex-col gap-3">
              {mission!.paths.map((p, pi) => {
                const isActive = p.id === activePath!.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setActivePathId(p.id)}
                    className={cn(
                      "cursor-pointer rounded-2xl border bg-paper/40 p-3 transition-colors",
                      isActive ? "border-brand ring-2 ring-brand/15" : "border-line hover:border-brand-line",
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft">Path {pi + 1}</span>
                      {isActive && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-bad-soft px-2 py-0.5 text-[10px] font-medium text-bad">
                          <span className="size-1.5 animate-pulse rounded-full bg-bad" /> Recording
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-start gap-2">
                      {p.screens.map((s, si) => {
                        const isGoal = si === p.screens.length - 1 && p.screens.length >= 2;
                        return (
                          <div key={si} className="group/th relative shrink-0">
                            <ScreenThumb page={s} w={150} ring={isGoal} host={host} />
                            {isGoal && (
                              <span className="absolute left-1 top-1 grid size-5 place-items-center rounded-full bg-brand text-white shadow-sm" title="Goal">
                                <FlagGlyph className="size-3" />
                              </span>
                            )}
                            {si > 0 && (
                              <button
                                onClick={(e) => { e.stopPropagation(); removeScreen(p.id, si); }}
                                aria-label="Remove step"
                                className="absolute right-1 top-1 hidden size-5 place-items-center rounded-full bg-ink/90 text-[10px] text-white shadow group-hover/th:grid hover:bg-bad"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {/* hint cell (only meaningful for the active path) */}
                      {isActive && (
                        <div className="flex h-[107px] min-w-[160px] flex-1 items-center justify-center rounded-md border border-dashed border-line-strong px-3 text-center text-[12px] text-ink-faint">
                          {p.screens.length === 1 ? (
                            <span>Click on your prototype 👉<br />to capture the path</span>
                          ) : (
                            <span>Keep clicking, or end the goal here</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={addPath}
              className="mt-3 rounded-[var(--radius)] border border-line-strong px-4 py-2 text-[12px] font-semibold uppercase tracking-wide text-ink-soft transition-colors hover:border-brand hover:text-brand"
            >
              + Add path
            </button>
          </div>
          </>
          )}
        </div>
      </section>

      {/* ── RIGHT · live prototype ────────────────────────────────── */}
      <div className="order-1 flex min-h-0 min-w-0 flex-col overflow-hidden bg-paper-sunk p-4 lg:order-3">
        {mission && activePath ? (
          <>
            <div className="mb-3 flex shrink-0 items-center gap-2 self-start rounded-full bg-bad px-3 py-1.5 text-[12px] font-medium text-white shadow-sm">
              <span className="size-2 animate-pulse rounded-full bg-white" /> Recording PATH {mission.paths.indexOf(activePath) + 1} — click the prototype
            </div>
            <DesktopFrame scale={previewScale} setScale={setPreviewScale}>
              <MockSite page={page} onHit={onHit} onMiss={() => {}} host={host} />
            </DesktopFrame>
          </>
        ) : (
          <>
            <div className="mb-3 flex shrink-0 items-center gap-2 self-start rounded-full border border-line bg-card px-3 py-1.5 text-[12px] font-medium text-ink-soft">
              Participant view
            </div>
            <div className="grid min-h-0 flex-1 place-items-center">
              <StatementPreview kind={isWelcome ? "welcome" : "thankyou"} text={isWelcome ? welcomeText : thankYouText} />
            </div>
          </>
        )}
      </div>

      {/* floating "Choose a block type" popover (fixed → escapes the panel's overflow) */}
      {addOpen && addPos && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setAddOpen(false)} aria-hidden />
          <div
            className="fixed z-50 w-[320px] rounded-2xl border border-line bg-card p-2.5 shadow-[0_30px_70px_-30px_rgba(255,77,141,0.55)]"
            style={{ top: addPos.top, left: addPos.left }}
          >
            <div className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">Choose a block type</div>
            <button onClick={addMission} className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-brand-soft/50">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                <MissionGlyph className="size-4" />
              </span>
              <div>
                <div className="text-[13px] font-semibold">Mission</div>
                <div className="text-[12px] leading-snug text-ink-soft">Create a usability task for your testers</div>
              </div>
            </button>
            <div aria-disabled title="Coming soon" className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-2 py-2.5 text-left opacity-50">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-paper-sunk text-ink-faint">?</span>
              <div>
                <div className="flex items-center gap-1.5 text-[13px] font-semibold">
                  Yes/No <span className="rounded bg-paper-sunk px-1.5 text-[9px] font-semibold uppercase tracking-wide text-ink-faint">soon</span>
                </div>
                <div className="text-[12px] leading-snug text-ink-soft">Ask a question with a yes / no answer</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── helpers ──────────────────────────────────────────────────── */

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span className="text-[13px] font-semibold">
      {children}
      {required && <span className="text-brand"> *</span>}
    </span>
  );
}

/* What the participant sees for the Welcome / Thank-you statement. */
function StatementPreview({ kind, text }: { kind: "welcome" | "thankyou"; text: string }) {
  return (
    <div className="w-[min(92%,440px)] rounded-2xl border border-line bg-card p-7 text-center shadow-[0_24px_60px_-32px_rgba(52,36,58,0.35)]">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-brand-soft text-brand">
        {kind === "welcome" ? <EnterGlyph className="size-5" /> : <FlagGlyph className="size-5" />}
      </div>
      <h3 className="font-display mt-4 text-xl font-semibold tracking-normal">
        {kind === "welcome" ? "Welcome 👋" : "All done — thank you!"}
      </h3>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
        {text.trim() || (kind === "welcome" ? "Your welcome message will appear here." : "Your thank-you message will appear here.")}
      </p>
      <span className="mt-5 inline-flex h-10 items-center rounded-[var(--radius)] bg-brand px-4 text-sm font-medium text-white">
        {kind === "welcome" ? "Start test" : "Finish"}
      </span>
    </div>
  );
}

function SystemBlock({ label, icon, active, onClick }: { label: string; icon: "enter" | "flag"; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-2xl border bg-card px-3 py-2.5 text-left transition-colors",
        active ? "border-brand ring-2 ring-brand/15" : "border-line hover:border-brand-line",
      )}
    >
      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-ink text-white">
        {icon === "enter" ? <EnterGlyph className="size-3.5" /> : <FlagGlyph className="size-3.5" />}
      </span>
      <span className="text-[13px] font-semibold leading-none">{label}</span>
    </button>
  );
}

/* The live prototype renders at a FIXED 1440×1024 desktop layout (it never reflows) and is
   shown at a constant scale, so the preview is the same size on every screen. */
const FRAME_W = 1440;
const FRAME_H = 1024;
function DesktopFrame({ children, scale, setScale }: { children: React.ReactNode; scale: number; setScale: (s: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(0.6);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setFit(Math.min(r.width / FRAME_W, r.height / FRAME_H));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // never larger than what fits the pane → it's always shown in full, never cropped.
  const actual = Math.max(0.2, Math.min(scale, fit));
  const w = Math.round(FRAME_W * actual);
  const h = Math.round(FRAME_H * actual);

  function onDragStart(e: React.PointerEvent) {
    e.preventDefault();
    const startX = e.clientX;
    const startScale = actual;
    const move = (ev: PointerEvent) => {
      // dragging the handle right (outward) enlarges; aspect stays locked.
      const next = startScale + (ev.clientX - startX) / 900;
      setScale(Math.min(0.95, Math.max(0.4, +next.toFixed(3))));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  return (
    <div ref={ref} className="grid min-h-0 min-w-0 flex-1 place-items-center">
      <div
        className="relative overflow-hidden rounded-2xl border border-line-strong bg-white shadow-[0_24px_60px_-32px_rgba(52,36,58,0.35)]"
        style={{ width: w, height: h }}
      >
        <div style={{ width: FRAME_W, height: FRAME_H, transform: `scale(${actual})`, transformOrigin: "top left" }}>
          {children}
        </div>
        {/* drag-to-resize handle, on the right edge */}
        <button
          onPointerDown={onDragStart}
          aria-label="Drag to resize preview"
          title="Drag to resize"
          className="absolute bottom-2 right-2 z-20 grid size-7 cursor-nwse-resize touch-none place-items-center rounded-lg bg-ink/75 text-white shadow-md hover:bg-ink"
        >
          <svg viewBox="0 0 16 16" fill="none" className="size-3.5">
            <path d="M12.5 6.5l-6 6M12.5 10.5l-2 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-4" style={{ transform: dir === "right" ? "rotate(180deg)" : undefined }}>
      <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* A scaled-down, non-interactive snapshot of the prototype at a given screen. */
function ScreenThumb({ page, w = 128, ring, host }: { page: SitePage; w?: number; ring?: boolean; host?: string }) {
  const SRC_W = 1440;
  const SRC_H = 1024;
  const scale = w / SRC_W;
  const h = Math.round(SRC_H * scale);
  return (
    <div
      className={cn("relative overflow-hidden rounded-md border bg-white", ring ? "border-brand" : "border-line")}
      style={{ width: w, height: h }}
      title={screenName[page]}
      aria-hidden
    >
      <div
        style={{ width: SRC_W, height: SRC_H, transform: `scale(${scale})`, transformOrigin: "top left", pointerEvents: "none" }}
      >
        <MockSite page={page} onHit={() => {}} onMiss={() => {}} host={host} />
      </div>
    </div>
  );
}

function MissionGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className}>
      <rect x="3" y="2" width="10" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 6h4M6 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function EnterGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M6 3h6v10H6M9 8H2m0 0 2.5-2.5M2 8l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function TrashGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M2.5 4h11M6 4V2.8c0-.4.3-.8.8-.8h2.4c.5 0 .8.4.8.8V4M12.5 4l-.5 8.4c0 .6-.5 1.1-1.1 1.1H5.1c-.6 0-1.1-.5-1.1-1.1L3.5 4M6.5 7v3.5M9.5 7v3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function FlagGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M4.4 2.2V14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M5.4 2.9h6.4c.5 0 .73.62.36.97L10.4 5.4l1.76 1.53c.37.32.14.97-.36.97H5.4z" fill="currentColor" />
    </svg>
  );
}
