"use client";

import dynamic from "next/dynamic";

import type { Card, KanaSelectionKey, KanaScript } from "@/lib/types";

type KanaSessionRendererProps = {
  script: KanaScript;
  groups: KanaSelectionKey[];
  cards: Card[];
};

const KanaSessionClient = dynamic(
  () => import("@/components/kana/kana-session-client").then((mod) => mod.KanaSessionClient),
  { ssr: false },
);

export function KanaSessionRenderer(props: KanaSessionRendererProps) {
  return <KanaSessionClient {...props} />;
}
