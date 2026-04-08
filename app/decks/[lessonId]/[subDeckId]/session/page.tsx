import { redirect } from "next/navigation";

import lessonsData from "@/data/lessons.json";
import { DeckSessionRenderer } from "@/components/session/deck-session-renderer";
import type { CardFilter, CardType, FlipSetting, LessonsData, StudyMode } from "@/lib/types";

type DeckSessionPageProps = {
  params: Promise<{ lessonId: string; subDeckId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const validModes = new Set<StudyMode>(["flashcard", "multiple-choice"]);
const validFlips = new Set<FlipSetting>(["jp-to-en", "en-to-jp"]);

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DeckSessionPage({
  params,
  searchParams,
}: DeckSessionPageProps) {
  const { lessonId, subDeckId } = await params;
  const query = await searchParams;

  const rawMode = firstParam(query.mode);
  const rawFlip = firstParam(query.flip);
  const rawTypes = firstParam(query.types);
  const rawFilter = (firstParam(query.filter) ?? "all") as CardFilter;

  if (
    !rawMode ||
    !rawFlip ||
    !validModes.has(rawMode as StudyMode) ||
    !validFlips.has(rawFlip as FlipSetting)
  ) {
    redirect(`/decks/${lessonId}/${subDeckId}`);
  }

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

  let cards = isStudyAll
    ? lesson.subDecks.flatMap((sd) => sd.cards)
    : subDeck!.cards;

  // Apply type filter
  if (rawTypes) {
    const allowedTypes = new Set(rawTypes.split(",") as CardType[]);
    const filtered = cards.filter((c) => allowedTypes.has(c.type));
    if (filtered.length > 0) cards = filtered;
  }

  // Build a subDeckId → cards mapping for MC distractor generation
  const allSubDeckCards = isStudyAll
    ? lesson.subDecks.flatMap((sd) => sd.cards)
    : lesson.subDecks.find((sd) => sd.id === subDeckId)?.cards ?? cards;

  // For SRS, we need to know the sub-deck IDs for each card
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
      flip={rawFlip as FlipSetting}
      cardSubDeckIds={cardSubDeckIds}
      cardIndexes={cardIndexes}
      allLessonCards={allSubDeckCards}
      cardFilter={rawFilter}
    />
  );
}
