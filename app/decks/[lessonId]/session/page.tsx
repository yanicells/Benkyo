import { redirect } from "next/navigation";

import lessonsData from "@/data/lessons.json";
import { PageShell } from "@/components/shared/page-shell";
import { DeckSessionRenderer } from "@/components/session/deck-session-renderer";
import type { FlipSetting, LessonsData, StudyMode } from "@/lib/types";

type DeckSessionPageProps = {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const validModes = new Set<StudyMode>([
  "flashcard",
  "multiple-choice",
  "typing",
]);
const validFlips = new Set<FlipSetting>(["jp-to-en", "en-to-jp"]);

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DeckSessionPage({
  params,
  searchParams,
}: DeckSessionPageProps) {
  const { lessonId } = await params;
  const query = await searchParams;

  const rawMode = firstParam(query.mode);
  const rawFlip = firstParam(query.flip);

  if (
    !rawMode ||
    !rawFlip ||
    !validModes.has(rawMode as StudyMode) ||
    !validFlips.has(rawFlip as FlipSetting)
  ) {
    redirect(`/decks/${lessonId}`);
  }

  const lessons = (lessonsData as LessonsData).lessons;
  const lesson = lessons.find((item) => item.id === lessonId);

  if (!lesson) {
    redirect("/decks");
  }

  return (
    <PageShell
      eyebrow="Active session"
      title={lesson.title}
      subtitle="Focus on one card at a time. Wrong cards get recycled until cleared."
      backHref={`/decks/${lesson.id}`}
    >
      <DeckSessionRenderer
        lessonId={lesson.id}
        lessonTitle={lesson.title}
        cards={lesson.cards}
        mode={rawMode as StudyMode}
        flip={rawFlip as FlipSetting}
      />
    </PageShell>
  );
}
