import lessonsData from "@/data/lessons.json";
import { LessonDeckGrid } from "@/components/decks/lesson-deck-grid";
import { PageShell } from "@/components/shared/page-shell";
import type { LessonsData } from "@/lib/types";

export default function DecksPage() {
  const lessons = (lessonsData as unknown as LessonsData).lessons;

  return (
    <PageShell
      eyebrow="CURRICULUM OVERVIEW"
      title="Mastery Journey"
      subtitle="Your path to Japanese fluency, structured through editorial precision and meditative focus. Progress through the foundations to reach N1 mastery."
      stickyHeader
    >
      <LessonDeckGrid lessons={lessons} />
    </PageShell>
  );
}
