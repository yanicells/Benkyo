import { redirect } from "next/navigation";

import lessonsData from "@/data/lessons.json";
import { PageShell } from "@/components/shared/page-shell";
import { SubDeckGrid } from "@/components/decks/sub-deck-grid";
import { LessonPreStudy } from "@/components/decks/lesson-pre-study";
import { LessonProgressOverview } from "@/components/decks/lesson-progress-overview";
import { DeckSearchFilter } from "@/components/decks/deck-search-filter";
import type { LessonsData } from "@/lib/types";

type SubDeckListPageProps = {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SubDeckListPage({
  params,
  searchParams,
}: SubDeckListPageProps) {
  const { lessonId } = await params;
  const query = await searchParams;
  const fromParam = Array.isArray(query.from) ? query.from[0] : query.from;
  const lessons = (lessonsData as unknown as LessonsData).lessons;
  const lesson = lessons.find((item) => item.id === lessonId);

  if (!lesson) {
    redirect("/decks");
  }

  const totalCards = lesson.subDecks.reduce(
    (sum, sd) => sum + sd.cards.length,
    0,
  );

  const fromKanji = fromParam === "kanji" || lessonId.startsWith("jlpt-");
  const backHref = fromKanji ? "/decks/kanji" : "/decks";
  const backLabel = fromKanji ? "Kanji Decks" : "All Lessons";

  return (
    <PageShell
      eyebrow={fromKanji ? "Kanji" : "Lesson"}
      title={lesson.title}
      subtitle={`${lesson.subDecks.length} sub-decks · ${totalCards} cards total`}
      tightTop
      tightTopOnMobile
      backHref={backHref}
      backLabel={backLabel}
    >
      {lesson.meta && <LessonPreStudy meta={lesson.meta} />}
      <LessonProgressOverview lesson={lesson} />
      <DeckSearchFilter lessons={lessons} scope="lesson" lesson={lesson}>
        <SubDeckGrid lesson={lesson} />
      </DeckSearchFilter>
    </PageShell>
  );
}
