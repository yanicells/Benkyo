"use client";

import dynamic from "next/dynamic";

import type { Card, CardFilter, FlipSetting, StudyMode } from "@/lib/types";

type DeckSessionRendererProps = {
  lessonId: string;
  subDeckId: string;
  lessonTitle: string;
  cards: Card[];
  mode: StudyMode;
  flip: FlipSetting;
  cardSubDeckIds: string[];
  cardIndexes: number[];
  allLessonCards: Card[];
  isReview?: boolean;
  reviewLabels?: string[];
  cardFilter?: CardFilter;
};

const DeckSessionClient = dynamic(
  () =>
    import("@/components/session/deck-session-client").then(
      (mod) => mod.DeckSessionClient,
    ),
  { ssr: false },
);

export function DeckSessionRenderer(props: DeckSessionRendererProps) {
  return <DeckSessionClient {...props} />;
}
