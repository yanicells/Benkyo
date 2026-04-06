import { redirect } from "next/navigation";

import lessonsData from "@/data/lessons.json";
import { PageShell } from "@/components/shared/page-shell";
import { SubDeckGrid } from "@/components/decks/sub-deck-grid";
import { LessonPreStudy } from "@/components/decks/lesson-pre-study";
import { LessonProgressOverview } from "@/components/decks/lesson-progress-overview";
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
      subtitle={`${lesson.subDecks.length} sub-decks · ${totalCards} cards total`}
      backHref="/decks"
      backLabel="All Lessons"
    >
      <LessonProgressOverview lesson={lesson} />
      {lesson.meta && (
        <LessonPreStudy meta={lesson.meta} />
      )}
      <SubDeckGrid lesson={lesson} />
    </PageShell>
  );
}
