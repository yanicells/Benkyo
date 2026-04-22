import { redirect } from "next/navigation";

import reviewerData from "@/data/reviewer.json";
import { PageShell } from "@/components/shared/page-shell";
import { SubDeckGrid } from "@/components/decks/sub-deck-grid";
import { LessonPreStudy } from "@/components/decks/lesson-pre-study";
import { LessonProgressOverview } from "@/components/decks/lesson-progress-overview";
import { DeckSearchFilter } from "@/components/decks/deck-search-filter";
import type { LessonsData } from "@/lib/types";

type SubDeckListPageProps = {
  params: Promise<{ lessonId: string }>;
};

export default async function ReviewerSubDeckListPage({
  params,
}: SubDeckListPageProps) {
  const { lessonId } = await params;
  const lessons = (reviewerData as unknown as LessonsData).lessons;
  const lesson = lessons.find((item) => item.id === lessonId);

  if (!lesson) {
    redirect("/reviewer");
  }

  const totalCards = lesson.subDecks.reduce(
    (sum, sd) => sum + sd.cards.length,
    0,
  );

  return (
    <PageShell
      eyebrow="Reviewer"
      title={lesson.title}
      subtitle={`${lesson.subDecks.length} sub-decks · ${totalCards} cards total`}
      tightTop
      tightTopOnMobile
      backHref="/reviewer"
      backLabel="All Reviewers"
    >
      {lesson.meta && <LessonPreStudy meta={lesson.meta} />}
      <LessonProgressOverview lesson={lesson} />
      <DeckSearchFilter
        lessons={lessons}
        scope="lesson"
        lesson={lesson}
        basePath="/reviewer"
      >
        <SubDeckGrid lesson={lesson} basePath="/reviewer" />
      </DeckSearchFilter>
    </PageShell>
  );
}
