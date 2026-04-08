import { redirect } from "next/navigation";

import readingsData from "@/data/reading.json";
import { PageShell } from "@/components/shared/page-shell";
import { ReadingPreStudy } from "@/components/reading/reading-pre-study";
import { ReadingDifficultyClient } from "@/components/reading/reading-difficulty-client";
import type { ReadingDifficulty, ReadingsDataV2 } from "@/lib/types";

type Props = {
  params: Promise<{ difficulty: string }>;
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

export default async function ReadingDifficultyPage({ params }: Props) {
  const { difficulty } = await params;

  if (!VALID_DIFFICULTIES.has(difficulty as ReadingDifficulty)) {
    redirect("/reading");
  }

  const data = readingsData as unknown as ReadingsDataV2;
  const group = data.difficulties.find((d) => d.key === difficulty);

  if (!group) {
    redirect("/reading");
  }

  const diffKey = difficulty as ReadingDifficulty;
  const diffMeta = {
    notes: group.description,
    difficulty: diffKey === "simple" ? "beginner" as const : diffKey === "intermediate" ? "intermediate" as const : "advanced" as const,
    estimatedMinutes: group.stories.reduce(
      (sum, s) => sum + (s.meta.estimatedMinutes || 0),
      0,
    ),
    cheatSheet: group.stories
      .flatMap((s) => s.meta.cheatSheet.slice(0, 2))
      .slice(0, 6),
    tags: [...new Set(group.stories.flatMap((s) => s.meta.tags ?? []))],
    sourceLessons: [
      ...new Set(group.stories.flatMap((s) => s.meta.sourceLessons)),
    ],
  };

  return (
    <PageShell
      eyebrow="Reading"
      title={`${DIFFICULTY_LABELS[diffKey]} Stories`}
      subtitle={`${group.stories.length} stories to practice reading comprehension.`}
      tightTopOnMobile
      backHref="/reading"
      backLabel="Reading"
    >
      <ReadingPreStudy meta={diffMeta} />
      <ReadingDifficultyClient stories={group.stories} difficulty={diffKey} />
    </PageShell>
  );
}
