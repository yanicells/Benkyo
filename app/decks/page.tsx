import lessonsData from "@/data/lessons.json";
import { LessonDeckGrid } from "@/components/decks/lesson-deck-grid";
import { PageShell } from "@/components/shared/page-shell";
import type { LessonsData } from "@/lib/types";

export default function DecksPage() {
  const lessons = (lessonsData as LessonsData).lessons;

  return (
    <PageShell
      eyebrow="Vocabulary"
      title="Lesson decks"
      subtitle="Choose any lesson and tune your session before starting."
    >
      <LessonDeckGrid lessons={lessons} />
    </PageShell>
  );
}
