import { redirect } from "next/navigation";

import lessonsData from "@/data/lessons.json";
import { PageShell } from "@/components/shared/page-shell";
import { SubDeckGrid } from "@/components/decks/sub-deck-grid";
import type { LessonsData } from "@/lib/types";

type SubDeckListPageProps = {
  params: Promise<{ lessonId: string }>;
};

export default async function SubDeckListPage({
  params,
}: SubDeckListPageProps) {
  const { lessonId } = await params;
  const lessons = (lessonsData as unknown as LessonsData).lessons;
  const lesson = lessons.find((item) => item.id === lessonId);

  if (!lesson) {
    redirect("/decks");
  }

  const totalCards = lesson.subDecks.reduce(
    (sum, sd) => sum + sd.cards.length,
    0,
  );

  return (
    <PageShell
      eyebrow="Lesson"
      title={lesson.title}
      subtitle={`${lesson.subDecks.length} sub-decks with ${totalCards} cards total. Choose a sub-deck or study all.`}
      backHref="/decks"
    >
      <SubDeckGrid lesson={lesson} />
    </PageShell>
  );
}
