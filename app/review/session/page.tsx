import { redirect } from "next/navigation";

import lessonsData from "@/data/lessons.json";
import { PageShell } from "@/components/shared/page-shell";
import { ReviewSessionRenderer } from "@/components/review/review-session-renderer";
import type { FlipSetting, LessonsData, StudyMode } from "@/lib/types";

type ReviewSessionPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const validModes = new Set<StudyMode>(["flashcard", "multiple-choice"]);
const validFlips = new Set<FlipSetting>(["jp-to-en", "en-to-jp"]);

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ReviewSessionPage({
  searchParams,
}: ReviewSessionPageProps) {
  const query = await searchParams;
  const rawMode = firstParam(query.mode);
  const rawFlip = firstParam(query.flip);

  if (
    !rawMode ||
    !rawFlip ||
    !validModes.has(rawMode as StudyMode) ||
    !validFlips.has(rawFlip as FlipSetting)
  ) {
    redirect("/review");
  }

  const lessons = (lessonsData as unknown as LessonsData).lessons;

  return (
    <PageShell
      eyebrow="Review session"
      title="Due cards"
      subtitle="Reviewing cards due across all decks. Rate your confidence after each answer."

    >
      <ReviewSessionRenderer
        lessons={lessons}
        mode={rawMode as StudyMode}
        flip={rawFlip as FlipSetting}
      />
    </PageShell>
  );
}
