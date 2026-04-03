import { redirect } from "next/navigation";

import lessonsData from "@/data/lessons.json";
import { PageShell } from "@/components/shared/page-shell";
import { DeckResultsClient } from "@/components/results/deck-results-client";
import type { LessonsData } from "@/lib/types";

type DeckResultsPageProps = {
  params: Promise<{ lessonId: string; subDeckId: string }>;
};

export default async function DeckResultsPage({
  params,
}: DeckResultsPageProps) {
  const { lessonId, subDeckId } = await params;
  const lessons = (lessonsData as unknown as LessonsData).lessons;
  const lesson = lessons.find((item) => item.id === lessonId);

  if (!lesson) {
    redirect("/decks");
  }

  const isStudyAll = subDeckId === "all";
  const subDeck = isStudyAll
    ? null
    : lesson.subDecks.find((sd) => sd.id === subDeckId);

  const title = isStudyAll ? `${lesson.title} — All` : subDeck?.title ?? lesson.title;

  return (
    <PageShell
      eyebrow="Results"
      title="Session summary"
      subtitle="Review cards you missed and run it again while memory is fresh."

    >
      <DeckResultsClient
        lessonId={lessonId}
        subDeckId={subDeckId}
        lessonTitle={title}
      />
    </PageShell>
  );
}
