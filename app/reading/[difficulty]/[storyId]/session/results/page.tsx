import { redirect } from "next/navigation";

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

  return (
    <ReadingResultsClient
      difficulty={difficulty as ReadingDifficulty}
      storyId={storyId}
    />
  );
}
