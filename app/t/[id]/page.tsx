import { Runner } from "@/components/runner";

export default async function ParticipantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Runner testId={id} />;
}
