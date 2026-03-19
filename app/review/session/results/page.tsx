import { PageShell } from "@/components/shared/page-shell";
import { DeckResultsClient } from "@/components/results/deck-results-client";

export default function ReviewResultsPage() {
  return (
    <PageShell
      eyebrow="Results"
      title="Review summary"
      subtitle="How your review session went."
      backHref="/review"
    >
      <DeckResultsClient
        lessonId="review"
        subDeckId="review"
        lessonTitle="Due Card Review"
        isReview
      />
    </PageShell>
  );
}
