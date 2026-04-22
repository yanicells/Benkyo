import reviewerData from "@/data/reviewer.json";
import { LessonDeckGrid } from "@/components/decks/lesson-deck-grid";
import { PageShell } from "@/components/shared/page-shell";
import type { LessonsData } from "@/lib/types";

export default function ReviewerPage() {
  const lessons = (reviewerData as unknown as LessonsData).lessons;

  return (
    <PageShell
      eyebrow="Reviewer"
      title="Reviewer Decks"
      subtitle="Test applied knowledge per lesson with translation and fill-in-the-blank drills."
    >
      <LessonDeckGrid lessons={lessons} showGrid={false} basePath="/reviewer" />
      <div className="mt-2 sm:mt-4">
        <LessonDeckGrid
          lessons={lessons}
          showOverview={false}
          basePath="/reviewer"
        />
      </div>
    </PageShell>
  );
}
