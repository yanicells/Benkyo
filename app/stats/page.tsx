import lessonsData from "@/data/lessons.json";
import { PageShell } from "@/components/shared/page-shell";
import { StatsClient } from "@/components/stats/stats-client";
import type { LessonsData } from "@/lib/types";

export default function StatsPage() {
  const lessons = (lessonsData as unknown as LessonsData).lessons;

  return (
    <PageShell
      eyebrow="Analytics"
      title="Progress"
      subtitle="Track your study habits, accuracy, and mastery across all decks."

    >
      <StatsClient lessons={lessons} />
    </PageShell>
  );
}
