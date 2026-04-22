import { redirect } from "next/navigation";

import reviewerData from "@/data/reviewer.json";
import { SubDeckStudyClient } from "@/components/decks/sub-deck-study-client";
import type { LessonsData } from "@/lib/types";

type SubDeckConfigPageProps = {
  params: Promise<{ lessonId: string; subDeckId: string }>;
};

export default async function ReviewerSubDeckConfigPage({
  params,
}: SubDeckConfigPageProps) {
  const { lessonId, subDeckId } = await params;
  const lessons = (reviewerData as unknown as LessonsData).lessons;
  const lesson = lessons.find((item) => item.id === lessonId);

  if (!lesson) {
    redirect("/reviewer");
  }

  const isStudyAll = subDeckId === "all";
  const subDeck = isStudyAll
    ? null
    : lesson.subDecks.find((sd) => sd.id === subDeckId);

  if (!isStudyAll && !subDeck) {
    redirect(`/reviewer/${lessonId}`);
  }

  const cards = isStudyAll
    ? lesson.subDecks.flatMap((sd) => sd.cards)
    : subDeck!.cards;

  const progressCardRefs = isStudyAll
    ? lesson.subDecks.flatMap((sd) =>
        sd.cards.map((_, cardIndex) => ({
          subDeckId: sd.id,
          cardIndex,
        })),
      )
    : subDeck!.cards.map((_, cardIndex) => ({
        subDeckId: subDeck!.id,
        cardIndex,
      }));

  const title = isStudyAll ? `${lesson.title} — All Cards` : subDeck!.title;
  const cardTypes = [...new Set(cards.map((c) => c.type))];
  const backHref = `/reviewer/${lessonId}`;
  const backLabel = lesson.title;

  return (
    <SubDeckStudyClient
      lessonId={lessonId}
      subDeckId={subDeckId}
      title={title}
      lessonTitle={lesson.title}
      backHref={backHref}
      backLabel={backLabel}
      cardCount={cards.length}
      cardTypes={cardTypes}
      meta={lesson.meta ?? null}
      cards={cards}
      progressCardRefs={progressCardRefs}
      basePath="/reviewer"
    />
  );
}
