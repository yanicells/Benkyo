"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import type { FlipSetting, Lesson, StudyMode } from "@/lib/types";
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

type ReviewData = ReturnType<typeof buildReviewData>;

function buildReviewData(lessons: Lesson[]) {
  const due = getDueCards(lessons);
  const shuffled = [...due].sort(() => Math.random() - 0.5);
  return {
    cards: shuffled.map((d) => d.card),
    subDeckIds: shuffled.map((d) => d.subDeckId),
    indexes: shuffled.map((d) => {
      const parts = d.cardId.split(":");
      return Number.parseInt(parts[parts.length - 1], 10);
    }),
    labels: shuffled.map((d) => d.subDeckTitle),
    allCards: lessons.flatMap((l) => l.subDecks.flatMap((sd) => sd.cards)),
  };
}

export function ReviewSessionRenderer({
  lessons,
  mode,
  flip,
}: ReviewSessionRendererProps) {
  const [data] = useState<ReviewData | null>(() => {
    if (typeof window === "undefined") return null;
    return buildReviewData(lessons);
  });

  if (!data) {
    return (
      <div className="rounded-2xl border border-rose-900/10 bg-white p-6 text-center">
        <p className="text-base text-slate-700">Loading due cards...</p>
      </div>
    );
  }

  if (data.cards.length === 0) {
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
      cards={data.cards}
      mode={mode}
      flip={flip}
      cardSubDeckIds={data.subDeckIds}
      cardIndexes={data.indexes}
      allLessonCards={data.allCards}
      isReview
      reviewLabels={data.labels}
    />
  );
}
