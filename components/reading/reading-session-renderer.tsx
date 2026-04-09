"use client";

import dynamic from "next/dynamic";
import type { ReadingStory } from "@/lib/types";

type ReadingSessionRendererProps = {
  story: ReadingStory;
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
