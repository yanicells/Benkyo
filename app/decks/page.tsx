import lessonsData from "@/data/lessons.json";
import { LessonDeckGrid } from "@/components/decks/lesson-deck-grid";
import { DeckSearchFilter } from "@/components/decks/deck-search-filter";
import { PageShell } from "@/components/shared/page-shell";
import type { LessonsData } from "@/lib/types";

export default function DecksPage() {
  const lessons = (lessonsData as unknown as LessonsData).lessons;

  return (
    <PageShell
      eyebrow="Lessons"
      title="Lesson Decks"
      subtitle="Study vocabulary and grammar across all Genki lessons with spaced repetition."
    >
      <LessonDeckGrid lessons={lessons} showGrid={false} />
      <div className="mt-2 sm:mt-4">
        <DeckSearchFilter lessons={lessons}>
          <LessonDeckGrid lessons={lessons} showOverview={false} />
        </DeckSearchFilter>
      </div>
    </PageShell>
  );
}
