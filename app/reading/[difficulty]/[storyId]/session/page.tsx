import { redirect } from "next/navigation";

import readingsData from "@/data/reading.json";
import { ReadingSessionRenderer } from "@/components/reading/reading-session-renderer";
import type { ReadingDifficulty, ReadingsDataV2 } from "@/lib/types";

type Props = {
  params: Promise<{ difficulty: string; storyId: string }>;
};

const VALID_DIFFICULTIES = new Set<ReadingDifficulty>([
  "simple",
  "intermediate",
  "hard",
]);

export default async function ReadingSessionPage({ params }: Props) {
  const { difficulty, storyId } = await params;

  if (!VALID_DIFFICULTIES.has(difficulty as ReadingDifficulty)) {
    redirect("/reading");
  }

  const data = readingsData as unknown as ReadingsDataV2;
  const group = data.difficulties.find((d) => d.key === difficulty);

  if (!group) {
    redirect("/reading");
  }

  const story = group.stories.find((s) => s.id === storyId);

  if (!story) {
    redirect(`/reading/${difficulty}`);
  }

  return <ReadingSessionRenderer story={story} />;
}
