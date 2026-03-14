"use client";

import dynamic from "next/dynamic";

import type { Card, FlipSetting, StudyMode } from "@/lib/types";

type DeckSessionRendererProps = {
  lessonId: string;
  lessonTitle: string;
  cards: Card[];
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

export function DeckSessionRenderer(props: DeckSessionRendererProps) {
  return <DeckSessionClient {...props} />;
}
