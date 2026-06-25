// Browser-local persistence for the prototype: tests created by the user and
// the participant sessions run against them. No backend — everything lives in
// localStorage so the dashboard reflects real (not mocked) activity per user.

export type TestStatus = "draft" | "live";
export type StoredScenario = { id: string; title: string; instruction?: string };
export type StoredTest = {
  id: string;
  name: string;
  url: string;
  status: TestStatus;
  createdAt: number;
  scenarios: StoredScenario[];
};
export type TaskResult = {
  scenarioId?: string;
  title: string;
  outcome: "completed" | "gave_up";
  seconds: number;
  misclicks: number;
};
export type StoredSession = { id: string; testId: string; name: string; at: number; tasks: TaskResult[] };

const TESTS_KEY = "pawprints.tests.v1";
const SESS_KEY = "pawprints.sessions.v1";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — ignore for a prototype */
  }
}

export function slugify(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "test";
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

export function loadTests(): StoredTest[] {
  return read<StoredTest[]>(TESTS_KEY, []).sort((a, b) => b.createdAt - a.createdAt);
}
export function getStoredTest(id: string): StoredTest | undefined {
  return loadTests().find((t) => t.id === id);
}
export function upsertTest(test: StoredTest) {
  const rest = read<StoredTest[]>(TESTS_KEY, []).filter((t) => t.id !== test.id);
  write(TESTS_KEY, [test, ...rest]);
}
export function deleteTest(id: string) {
  write(TESTS_KEY, read<StoredTest[]>(TESTS_KEY, []).filter((t) => t.id !== id));
  write(SESS_KEY, read<StoredSession[]>(SESS_KEY, []).filter((s) => s.testId !== id));
}

export function loadSessions(testId: string): StoredSession[] {
  return read<StoredSession[]>(SESS_KEY, []).filter((s) => s.testId === testId);
}
export function addSession(session: StoredSession) {
  write(SESS_KEY, [session, ...read<StoredSession[]>(SESS_KEY, [])]);
}

export type Summary = {
  participants: number;
  successRate: number | null; // %
  avgSeconds: number | null; // time on task
  avgMisclicks: number | null; // off-path clicks
  /** per-participant time-on-task (seconds), newest last — for a sparkline */
  trend: number[];
};
export function summarize(testId: string): Summary {
  const sessions = loadSessions(testId).slice().sort((a, b) => a.at - b.at);
  const tasks = sessions.flatMap((s) => s.tasks);
  if (!tasks.length) {
    return { participants: sessions.length, successRate: null, avgSeconds: null, avgMisclicks: null, trend: [] };
  }
  const success = (tasks.filter((t) => t.outcome === "completed").length / tasks.length) * 100;
  const avgSeconds = tasks.reduce((a, t) => a + t.seconds, 0) / tasks.length;
  const avgMisclicks = tasks.reduce((a, t) => a + t.misclicks, 0) / tasks.length;
  const trend = sessions.map((s) => {
    const ts = s.tasks;
    return ts.length ? Math.round(ts.reduce((a, t) => a + t.seconds, 0) / ts.length) : 0;
  });
  return {
    participants: sessions.length,
    successRate: Math.round(success),
    avgSeconds: Math.round(avgSeconds),
    avgMisclicks: Math.round(avgMisclicks * 10) / 10,
    trend,
  };
}

export function fmtDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
