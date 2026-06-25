import { Logo } from "@/components/ui";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";

const ERRORS: Record<string, string> = {
  domain: "That isn't a gradion.com account. Please sign in with your @gradion.com Google account.",
  state: "Your sign-in session expired. Please try again.",
  token: "Sign-in failed. Please try again.",
  profile: "Couldn't read your Google profile. Please try again.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const message = error ? (ERRORS[error] ?? "Sign-in failed. Please try again.") : null;

  return (
    <div className="relative grid min-h-[100dvh] place-items-center overflow-hidden px-6">
      <AnimatedGradientBackground
        Breathing
        startingGap={120}
        breathingRange={7}
        animationSpeed={0.02}
        gradientColors={["#fff1f4", "#ffe0ec", "#ffc9dd", "#ffb0c9", "#ffc59e", "#ffe4cf", "#fff7f4"]}
        gradientStops={[35, 50, 60, 70, 80, 90, 100]}
      />

      <div className="relative z-10 w-[min(94vw,420px)] rounded-2xl border border-line bg-card/90 p-8 text-center shadow-[0_30px_70px_-40px_rgba(255,77,141,0.6)] backdrop-blur">
        <div className="flex justify-center">
          <Logo className="text-[20px]" bob={false} />
        </div>
        <h1 className="font-display mt-6 text-2xl font-semibold tracking-normal">Sign in to continue</h1>
        <p className="mt-2 text-sm text-ink-soft">This workspace is limited to gradion.com accounts.</p>

        {message && (
          <div className="mt-4 rounded-[var(--radius)] border border-bad/30 bg-bad-soft px-3 py-2.5 text-[13px] text-bad">
            {message}
          </div>
        )}

        <a
          href="/api/auth/login"
          className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-[var(--radius)] border border-line-strong bg-card text-sm font-semibold text-ink transition-colors hover:bg-paper-sunk"
        >
          <GoogleG className="size-5" />
          Continue with Google
        </a>

        <p className="mt-5 font-mono text-[11px] text-ink-faint">Pawprints · access restricted</p>
      </div>
    </div>
  );
}

function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
