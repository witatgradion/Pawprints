"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorShell, Crumb } from "@/components/creator-shell";
import { Card, Button, Eyebrow } from "@/components/ui";
import { slugify, upsertTest } from "@/lib/store";
import { cn } from "@/lib/cn";

export default function NewTestPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const urlValid = /\.\w{2,}/.test(url);
  const ready = urlValid && name.trim();

  function createAndContinue() {
    const id = slugify(name);
    upsertTest({ id, name: name.trim(), url, status: "draft", createdAt: Date.now(), scenarios: [] });
    router.push(`/tests/${id}/record?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}`);
  }

  return (
    <CreatorShell breadcrumb={<Crumb items={[{ label: "Usability testing", href: "/dashboard" }, { label: "New test" }]} />}>
      <div className="mx-auto max-w-3xl">
        <Eyebrow>Create · step 1 of 3</Eyebrow>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-normal">Set up a test</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Point Pawprints at a live site and name the test. Next, you&apos;ll create each scenario and
          record its happy path on a live preview of the site.
        </p>

        {/* target */}
        <Card className="mt-7 p-6">
          <Field label="Target URL" hint="The live page where the tasks begin. Only test sites you own or are permitted to test.">
            <div className="flex items-center gap-2 rounded-[var(--radius)] border border-line-strong bg-paper px-3 focus-within:border-brand">
              <span className="shrink-0 font-mono text-[13px] text-ink-faint">https://</span>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value.replace(/^https?:\/\//, ""))}
                placeholder="acme.store"
                className="h-10 min-w-0 flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-ink-faint"
              />
              {urlValid && (
                <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap font-mono text-[11px] text-good">
                  ✓ reachable
                </span>
              )}
            </div>
          </Field>
          <Field label="Test name" className="mt-5">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Store — Checkout & Account"
              className="h-10 w-full rounded-[var(--radius)] border border-line-strong bg-paper px-3 text-sm outline-none focus:border-brand placeholder:text-ink-faint"
            />
          </Field>
        </Card>

        <div className="mt-8 flex items-center justify-between border-t border-line pt-5">
          <p className="text-[13px] text-ink-faint">
            Next: create scenarios and record each one&apos;s happy path.
          </p>
          <Button disabled={!ready} onClick={createAndContinue}>
            Continue to scenarios →
          </Button>
        </div>
      </div>
    </CreatorShell>
  );
}

function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <div className="text-[13px] font-medium">{label}</div>
      {hint && <div className="mb-2 mt-0.5 text-[12px] text-ink-faint">{hint}</div>}
      {!hint && <div className="mb-2" />}
      {children}
    </label>
  );
}
