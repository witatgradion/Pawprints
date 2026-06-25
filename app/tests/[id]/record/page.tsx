import Link from "next/link";
import { Recorder } from "@/components/recorder";
import { Logo, LinkButton } from "@/components/ui";
import { getTest } from "@/lib/mock-data";

export default async function RecordPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ url?: string; name?: string }>;
}) {
  const { id } = await params;
  const { url, name } = await searchParams;
  const decodedUrl = url ? decodeURIComponent(url) : "";
  const decodedName = name ? decodeURIComponent(name) : getTest(id)?.name ?? "New test";
  // domain only, for the preview's address bar (content stays the stand-in site)
  const host = decodedUrl ? decodedUrl.replace(/^https?:\/\//, "").split("/")[0] : undefined;
  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-paper px-5">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <Logo className="text-[15px]" bob={false} />
          </Link>
          <span className="hidden text-sm leading-none text-ink-soft sm:flex sm:items-center">
            <Link href="/dashboard" className="hover:text-ink">Usability testing</Link>
            <span className="mx-2 text-ink-faint">/</span>
            <span className="font-medium text-ink">{decodedName}</span>
            <span className="mx-2 text-ink-faint">/</span>
            <span>Record</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-ink-faint hover:text-ink">
            Save &amp; exit
          </Link>
          <LinkButton href="/dashboard" size="sm">
            Finish →
          </LinkButton>
        </div>
      </header>
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <Recorder testId={id} name={decodedName} url={decodedUrl} host={host} />
      </div>
    </div>
  );
}
