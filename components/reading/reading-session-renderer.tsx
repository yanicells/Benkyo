"use client";

import dynamic from "next/dynamic";
import type { ReadingPassage, ReadingDifficulty } from "@/lib/types";

type ReadingSessionRendererProps = {
  passages: ReadingPassage[];
  difficulty: ReadingDifficulty;
};

const ReadingSessionClient = dynamic(
  () =>
    import("@/components/reading/reading-session-client").then(
      (mod) => mod.ReadingSessionClient,
    ),
  { ssr: false },
);

export function ReadingSessionRenderer(props: ReadingSessionRendererProps) {
  return <ReadingSessionClient {...props} />;
}
