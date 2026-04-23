import { redirect } from "next/navigation";

import reviewerData from "@/data/reviewer.json";
import { DeckSessionRenderer } from "@/components/session/deck-session-renderer";
import type { CardFilter, CardType, LessonsData, StudyMode } from "@/lib/types";

type DeckSessionPageProps = {
  params: Promise<{ lessonId: string; subDeckId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const validModes = new Set<StudyMode>(["flashcard", "multiple-choice"]);

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ReviewerSessionPage({
  params,
  searchParams,
}: DeckSessionPageProps) {
  const { lessonId, subDeckId } = await params;
  const query = await searchParams;

  const rawMode = firstParam(query.mode);
  const rawTypes = firstParam(query.types);
  const rawFilter = (firstParam(query.filter) ?? "all") as CardFilter;

  if (!rawMode || !validModes.has(rawMode as StudyMode)) {
    redirect(`/reviewer/${lessonId}/${subDeckId}`);
  }

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

  let cards = isStudyAll
    ? lesson.subDecks.flatMap((sd) => sd.cards)
    : subDeck!.cards;

  if (rawTypes) {
    const allowedTypes = new Set(rawTypes.split(",") as CardType[]);
    const filtered = cards.filter((c) => allowedTypes.has(c.type));
    if (filtered.length > 0) cards = filtered;
  }

  const allSubDeckCards = isStudyAll
    ? lesson.subDecks.flatMap((sd) => sd.cards)
    : lesson.subDecks.find((sd) => sd.id === subDeckId)?.cards ?? cards;

  const cardSubDeckIds: string[] = [];
  const cardIndexes: number[] = [];

  if (isStudyAll) {
    for (const sd of lesson.subDecks) {
      for (let i = 0; i < sd.cards.length; i++) {
        if (cards.includes(sd.cards[i])) {
          cardSubDeckIds.push(sd.id);
          cardIndexes.push(i);
        }
      }
    }
  } else {
    for (let i = 0; i < subDeck!.cards.length; i++) {
      if (cards.includes(subDeck!.cards[i])) {
        cardSubDeckIds.push(subDeck!.id);
        cardIndexes.push(i);
      }
    }
  }

  const sessionTitle = isStudyAll
    ? `${lesson.title} — All`
    : subDeck!.title;

  return (
    <DeckSessionRenderer
      lessonId={lessonId}
      subDeckId={subDeckId}
      lessonTitle={sessionTitle}
      cards={cards}
      mode={rawMode as StudyMode}
      cardSubDeckIds={cardSubDeckIds}
      cardIndexes={cardIndexes}
      allLessonCards={allSubDeckCards}
      cardFilter={rawFilter}
      basePath="/reviewer"
    />
  );
}
