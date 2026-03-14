import { redirect } from "next/navigation";

import lessonsData from "@/data/lessons.json";
import { PageShell } from "@/components/shared/page-shell";
import { DeckResultsClient } from "@/components/results/deck-results-client";
import type { LessonsData } from "@/lib/types";

type DeckResultsPageProps = {
  params: Promise<{ lessonId: string }>;
};

export default async function DeckResultsPage({
  params,
}: DeckResultsPageProps) {
  const { lessonId } = await params;
  const lessons = (lessonsData as LessonsData).lessons;
  const lesson = lessons.find((item) => item.id === lessonId);

  if (!lesson) {
    redirect("/decks");
  }

  return (
    <PageShell
      eyebrow="Results"
      title="Session summary"
      subtitle="Review cards you missed and run it again while memory is fresh."
      backHref={`/decks/${lesson.id}`}
    >
      <DeckResultsClient lessonId={lesson.id} lessonTitle={lesson.title} />
    </PageShell>
  );
}
