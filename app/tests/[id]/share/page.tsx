import Link from "next/link";
import { CreatorShell, Crumb } from "@/components/creator-shell";
import { Card, LinkButton, Eyebrow } from "@/components/ui";
import { CopyLink } from "@/components/copy-link";
import { getTest } from "@/lib/mock-data";

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const test = getTest(id);
  const shareUrl = `https://empathy.app/t/${id}`;

  return (
    <CreatorShell breadcrumb={<Crumb items={[{ label: "Tests", href: "/dashboard" }, { label: test?.name ?? id, href: `/tests/${id}/results` }, { label: "Share" }]} />}>
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-good-soft text-xl text-good">✓</div>
          <Eyebrow className="mt-4">Step 3 of 3 · ready</Eyebrow>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-normal">Your test is live</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
            Send this link to participants. Every click, give-up, and confusion flag is captured per
            scenario — results land in the report as they come in.
          </p>
        </div>

        <Card className="mt-7 p-6">
          <div className="text-[13px] font-medium">Participant link</div>
          <div className="mt-2">
            <CopyLink url={shareUrl} />
          </div>

          <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
            <Setting label="Devices" value="Desktop · Mobile" />
            <Setting label="Scenarios" value={`${test?.scenarios.length ?? 0} tasks`} />
            <Setting label="Recording" value="Anonymous" />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <LinkButton href={`/t/${id}`} variant="secondary">
              Preview as participant
            </LinkButton>
            <LinkButton href={`/tests/${id}/results`}>
              Go to the report →
            </LinkButton>
          </div>
        </Card>

        <p className="mt-5 text-center text-[12px] text-ink-faint">
          <Link href="/dashboard" className="hover:text-ink">Back to all tests</Link>
        </p>
      </div>
    </CreatorShell>
  );
}

function Setting({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card px-4 py-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">{label}</div>
      <div className="mt-1 text-[13px] font-medium">{value}</div>
    </div>
  );
}
