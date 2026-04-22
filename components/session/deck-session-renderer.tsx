"use client";

import dynamic from "next/dynamic";

import type { Card, CardFilter, StudyMode } from "@/lib/types";

type DeckSessionRendererProps = {
  lessonId: string;
  subDeckId: string;
  lessonTitle: string;
  cards: Card[];
  mode: StudyMode;
  cardSubDeckIds: string[];
  cardIndexes: number[];
  allLessonCards: Card[];
  isReview?: boolean;
  reviewLabels?: string[];
  cardFilter?: CardFilter;
  basePath?: "/decks" | "/reviewer";
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
