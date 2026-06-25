import { GoogleG, LinkButton, Logo } from "@/components/ui";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { CatLottie } from "@/components/ui/cat-lottie";
import { authConfigured } from "@/lib/auth";

const ERRORS: Record<string, string> = {
  domain: "That isn't a gradion.com account. Please sign in with your @gradion.com Google account.",
  state: "Your sign-in session expired. Please try again.",
  token: "Sign-in failed. Please try again.",
  profile: "Couldn't read your Google profile. Please try again.",
};

export default async function Landing({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const message = error ? (ERRORS[error] ?? "Sign-in failed. Please try again.") : null;

  return (
    <div className="relative min-h-[100dvh] overflow-hidden">
      {/* decorative animated gradient */}
      <AnimatedGradientBackground
        Breathing
        startingGap={120}
        breathingRange={7}
        animationSpeed={0.02}
        gradientColors={["#fff1f4", "#ffe0ec", "#ffc9dd", "#ffb0c9", "#ffc59e", "#ffe4cf", "#fff7f4"]}
        gradientStops={[35, 50, 60, 70, 80, 90, 100]}
      />

      {/* nav — centered logo */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-center px-6 py-6">
        <Logo className="text-[18px]" />
      </header>

      {/* hero — headline, description, Google sign-in */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100dvh-88px)] max-w-4xl flex-col items-center justify-center px-6 pb-16 text-center">
        <CatLottie className="fade-up mb-2 h-48 w-48 md:h-56 md:w-56" />
        <h1 className="fade-up font-display text-4xl font-semibold leading-[1.08] tracking-normal md:text-[52px]" style={{ animationDelay: "0.05s" }}>
          Cats don&apos;t follow instructions.
          <br /> Neither do your users.
        </h1>
        <p className="fade-up mt-6 max-w-xl text-lg leading-relaxed text-ink-soft" style={{ animationDelay: "0.1s" }}>
          Paste a URL, walk the right path once, share a link. Watch where real participants get
          lost — and read it back as a number, a sample size, and a confidence level. Never an
          unsupported adjective.
        </p>

        {message && (
          <div className="fade-up mt-6 max-w-md rounded-[var(--radius)] border border-bad/30 bg-bad-soft px-3 py-2.5 text-[13px] text-bad">
            {message}
          </div>
        )}

        <div className="fade-up mt-9" style={{ animationDelay: "0.2s" }}>
          {authConfigured() ? (
            <>
              <a
                href="/api/auth/login"
                className="inline-flex h-12 items-center justify-center gap-2.5 rounded-[var(--radius)] border border-line-strong bg-card px-6 text-sm font-semibold text-ink shadow-[0_10px_30px_-12px_rgba(255,77,141,0.5)] transition-colors hover:bg-paper-sunk"
              >
                <GoogleG className="size-5" />
                Continue with Google
              </a>
              <p className="mt-3 font-mono text-[11px] text-ink-faint">Limited to gradion.com accounts</p>
            </>
          ) : (
            <LinkButton href="/dashboard">Open the dashboard</LinkButton>
          )}
        </div>
      </section>
    </div>
  );
}
