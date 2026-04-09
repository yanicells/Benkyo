import { redirect } from "next/navigation";

import readingsData from "@/data/reading.json";
import { PageShell } from "@/components/shared/page-shell";
import { ReadingPreStudy } from "@/components/reading/reading-pre-study";
import { ReadingStoryClient } from "@/components/reading/reading-story-client";
import type { ReadingDifficulty, ReadingsDataV2 } from "@/lib/types";

type Props = {
  params: Promise<{ difficulty: string; storyId: string }>;
};

const VALID_DIFFICULTIES = new Set<ReadingDifficulty>([
  "simple",
  "intermediate",
  "hard",
]);

const DIFFICULTY_LABELS: Record<ReadingDifficulty, string> = {
  simple: "Beginner",
  intermediate: "Intermediate",
  hard: "Hard",
};

export default async function ReadingStoryPage({ params }: Props) {
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

  const diffKey = difficulty as ReadingDifficulty;

  return (
    <PageShell
      eyebrow="Reading"
      title={story.title}
      subtitle={`${story.passages.length} ${story.passages.length === 1 ? "passage" : "passages"} · ${story.questions.length} ${story.questions.length === 1 ? "question" : "questions"}`}
      tightTop
      tightTopOnMobile
      backHref={`/reading/${difficulty}`}
      backLabel={`${DIFFICULTY_LABELS[diffKey]} Stories`}
    >
      <ReadingPreStudy meta={story.meta} />
      <ReadingStoryClient story={story} difficulty={diffKey} />
    </PageShell>
  );
}
