import { redirect } from "next/navigation";

import lessonsData from "@/data/lessons.json";
import { DeckSessionRenderer } from "@/components/session/deck-session-renderer";
import { getKanjiSubDecks } from "@/lib/kanji";
import type { CardType, FlipSetting, LessonsData, StudyMode } from "@/lib/types";

type KanjiSessionPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const validModes = new Set<StudyMode>(["flashcard", "multiple-choice"]);
const validFlips = new Set<FlipSetting>(["jp-to-en", "en-to-jp"]);

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function KanjiSessionPage({
  searchParams,
}: KanjiSessionPageProps) {
  const query = await searchParams;
  const rawMode = firstParam(query.mode) ?? "flashcard";
  const rawFlip = firstParam(query.flip) ?? "jp-to-en";
  const rawTypes = firstParam(query.types);
  const rawDecks = firstParam(query.decks);

  if (
    !validModes.has(rawMode as StudyMode) ||
    !validFlips.has(rawFlip as FlipSetting)
  ) {
    redirect("/decks/kanji");
  }

  const lessons = (lessonsData as unknown as LessonsData).lessons;
  const allEntries = getKanjiSubDecks(lessons);

  // Filter to specific decks if provided
  const deckFilter = rawDecks ? new Set(rawDecks.split(",")) : null;
  const entries = deckFilter
    ? allEntries.filter((e) => deckFilter.has(e.subDeck.id))
    : allEntries;

  if (entries.length === 0) {
    redirect("/decks/kanji");
  }

  let cards = entries.flatMap((e) => e.subDeck.cards);

  // Apply type filter
  if (rawTypes) {
    const allowedTypes = new Set(rawTypes.split(",") as CardType[]);
    const filtered = cards.filter((c) => allowedTypes.has(c.type));
    if (filtered.length > 0) cards = filtered;
  }

  // Build card-to-subdeck mapping for SRS
  const cardSubDeckIds: string[] = [];
  const cardIndexes: number[] = [];
  const allKanjiCards = entries.flatMap((e) => e.subDeck.cards);

  for (const entry of entries) {
    for (let i = 0; i < entry.subDeck.cards.length; i++) {
      if (cards.includes(entry.subDeck.cards[i])) {
        cardSubDeckIds.push(entry.subDeck.id);
        cardIndexes.push(i);
      }
    }
  }

  return (
    <DeckSessionRenderer
      lessonId="kanji"
      subDeckId="all"
      lessonTitle="Kanji — All Decks"
      cards={cards}
      mode={rawMode as StudyMode}
      flip={rawFlip as FlipSetting}
      cardSubDeckIds={cardSubDeckIds}
      cardIndexes={cardIndexes}
      allLessonCards={allKanjiCards}
    />
  );
}
