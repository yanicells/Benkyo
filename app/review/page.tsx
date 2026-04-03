import lessonsData from "@/data/lessons.json";
import { PageShell } from "@/components/shared/page-shell";
import { ReviewConfigClient } from "@/components/review/review-config-client";
import type { LessonsData } from "@/lib/types";

export default function ReviewPage() {
  const lessons = (lessonsData as unknown as LessonsData).lessons;

  return (
    <PageShell
      eyebrow="Review"
      title="Review due cards"
      subtitle="Study cards that are due for review across all your decks."

    >
      <ReviewConfigClient lessons={lessons} />
    </PageShell>
  );
}
