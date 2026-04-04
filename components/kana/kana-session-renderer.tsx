"use client";

import dynamic from "next/dynamic";

import type {
  Card,
  KanaBatchSize,
  KanaSelectionKey,
  KanaScript,
} from "@/lib/types";

type KanaSessionRendererProps = {
  script: KanaScript;
  groups: KanaSelectionKey[];
  cards: Card[];
  batchSize: KanaBatchSize;
  shuffle: boolean;
  mode: "mc" | "typing";
};

const KanaSessionClient = dynamic(
  () =>
    import("@/components/kana/kana-session-client").then(
      (mod) => mod.KanaSessionClient,
    ),
  { ssr: false },
);

export function KanaSessionRenderer(props: KanaSessionRendererProps) {
  return <KanaSessionClient {...props} />;
}
