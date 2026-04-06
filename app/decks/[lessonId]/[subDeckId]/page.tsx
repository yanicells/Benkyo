import { redirect } from "next/navigation";

import lessonsData from "@/data/lessons.json";
import { SubDeckStudyClient } from "@/components/decks/sub-deck-study-client";
import type { LessonsData } from "@/lib/types";

type SubDeckConfigPageProps = {
  params: Promise<{ lessonId: string; subDeckId: string }>;
};

export default async function SubDeckConfigPage({
  params,
}: SubDeckConfigPageProps) {
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

  if (!isStudyAll && !subDeck) {
    redirect(`/decks/${lessonId}`);
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

  return (
    <SubDeckStudyClient
      lessonId={lessonId}
      subDeckId={subDeckId}
      title={title}
      lessonTitle={lesson.title}
      cardCount={cards.length}
      cardTypes={cardTypes}
      meta={lesson.meta ?? null}
      cards={cards}
      progressCardRefs={progressCardRefs}
    />
  );
}
