"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import type { Card, FlipSetting, Lesson, StudyMode } from "@/lib/types";
import { getDueCards } from "@/lib/srs";

type ReviewSessionRendererProps = {
  lessons: Lesson[];
  mode: StudyMode;
  flip: FlipSetting;
};

const DeckSessionClient = dynamic(
  () =>
    import("@/components/session/deck-session-client").then(
      (mod) => mod.DeckSessionClient,
    ),
  { ssr: false },
);

export function ReviewSessionRenderer({
  lessons,
  mode,
  flip,
}: ReviewSessionRendererProps) {
  const [ready, setReady] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [cardSubDeckIds, setCardSubDeckIds] = useState<string[]>([]);
  const [cardIndexes, setCardIndexes] = useState<number[]>([]);
  const [reviewLabels, setReviewLabels] = useState<string[]>([]);
  const [allLessonCards, setAllLessonCards] = useState<Card[]>([]);

  useEffect(() => {
    const due = getDueCards(lessons);

    if (due.length === 0) {
      setReady(true);
      return;
    }

    // Shuffle due cards
    const shuffled = [...due].sort(() => Math.random() - 0.5);

    setCards(shuffled.map((d) => d.card));
    setCardSubDeckIds(shuffled.map((d) => d.subDeckId));
    setCardIndexes(
      shuffled.map((d) => {
        const parts = d.cardId.split(":");
        return Number.parseInt(parts[parts.length - 1], 10);
      }),
    );
    setReviewLabels(shuffled.map((d) => d.subDeckTitle));
    setAllLessonCards(lessons.flatMap((l) => l.subDecks.flatMap((sd) => sd.cards)));
    setReady(true);
  }, [lessons]);

  if (!ready) {
    return (
      <div className="rounded-2xl border border-rose-900/10 bg-white p-6 text-center">
        <p className="text-base text-slate-700">Loading due cards...</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-base text-emerald-800">
          No cards are due for review right now.
        </p>
      </div>
    );
  }

  return (
    <DeckSessionClient
      lessonId="review"
      subDeckId="review"
      lessonTitle="Review — Due Cards"
      cards={cards}
      mode={mode}
      flip={flip}
      cardSubDeckIds={cardSubDeckIds}
      cardIndexes={cardIndexes}
      allLessonCards={allLessonCards}
      isReview
      reviewLabels={reviewLabels}
    />
  );
}
