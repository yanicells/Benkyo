import { redirect } from "next/navigation";

import { PageShell } from "@/components/shared/page-shell";
import { ReadingResultsClient } from "@/components/reading/reading-results-client";
import type { ReadingDifficulty } from "@/lib/types";

type Props = {
  params: Promise<{ difficulty: string; storyId: string }>;
};

const VALID_DIFFICULTIES = new Set<ReadingDifficulty>([
  "simple",
  "intermediate",
  "hard",
]);

export default async function ReadingResultsPage({ params }: Props) {
  const { difficulty, storyId } = await params;

  if (!VALID_DIFFICULTIES.has(difficulty as ReadingDifficulty)) {
    redirect("/reading");
  }

  const diffKey = difficulty as ReadingDifficulty;

  return (
    <PageShell
      eyebrow="Results"
      title="Reading summary"
      subtitle="Review how you did, then jump back in while it is still fresh."
    >
      <ReadingResultsClient difficulty={diffKey} storyId={storyId} />
    </PageShell>
  );
}
