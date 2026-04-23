import { redirect } from "next/navigation";

import lessonsData from "@/data/lessons.json";
import { ReviewSessionRenderer } from "@/components/review/review-session-renderer";
import type { LessonsData, StudyMode } from "@/lib/types";

type ReviewSessionPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const validModes = new Set<StudyMode>(["flashcard", "multiple-choice"]);

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ReviewSessionPage({
  searchParams,
}: ReviewSessionPageProps) {
  const query = await searchParams;
  const rawMode = firstParam(query.mode);

  if (!rawMode || !validModes.has(rawMode as StudyMode)) {
    redirect("/review");
  }

  const lessons = (lessonsData as unknown as LessonsData).lessons;

  return (
    <ReviewSessionRenderer
      lessons={lessons}
      mode={rawMode as StudyMode}
    />
  );
}
