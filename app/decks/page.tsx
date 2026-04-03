import lessonsData from "@/data/lessons.json";
import { LessonDeckGrid } from "@/components/decks/lesson-deck-grid";
import { PageShell } from "@/components/shared/page-shell";
import type { LessonsData } from "@/lib/types";

export default function DecksPage() {
  const lessons = (lessonsData as unknown as LessonsData).lessons;

  return (
    <PageShell
      eyebrow="PATH TO FLUENCY"
      title="Choose Your Lesson"
      subtitle="Curated modules designed for precision learning. Select a deck to begin your daily mastery session."
    >
      <LessonDeckGrid lessons={lessons} />
    </PageShell>
  );
}
