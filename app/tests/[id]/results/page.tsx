import { notFound } from "next/navigation";
import { CreatorShell, Crumb } from "@/components/creator-shell";
import { ResultsView } from "@/components/results-view";
import { getTest } from "@/lib/mock-data";

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ scenario?: string }>;
}) {
  const { id } = await params;
  const { scenario } = await searchParams;
  const test = getTest(id);
  if (!test) notFound();

  return (
    <CreatorShell breadcrumb={<Crumb items={[{ label: "Tests", href: "/dashboard" }, { label: test.name }, { label: "Report" }]} />}>
      <ResultsView test={test} initialScenario={scenario} />
    </CreatorShell>
  );
}
