import { redirect } from "next/navigation";

import { PageShell } from "@/components/shared/page-shell";
import { KanaSessionRenderer } from "@/components/kana/kana-session-renderer";
import { getKanaEntries, kanaSelectionKeys } from "@/lib/kana";
import type {
  Card,
  KanaBatchSize,
  KanaScript,
  KanaSelectionKey,
} from "@/lib/types";

type KanaSessionPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const validScripts = new Set<KanaScript>(["hiragana", "katakana"]);
const validGroups = new Set<KanaSelectionKey>(kanaSelectionKeys);
const validBatchSizes = new Set<KanaBatchSize>([1, 2, 3, 4]);

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function KanaSessionPage({
  searchParams,
}: KanaSessionPageProps) {
  const query = await searchParams;
  const script = firstParam(query.script);
  const groupParam = firstParam(query.groups);
  const batchParam = firstParam(query.batch);
  const shuffleParam = firstParam(query.shuffle);
  const modeParam = firstParam(query.mode);
  const typingDifficultyParam = firstParam(query.typingDifficulty);

  if (!script || !validScripts.has(script as KanaScript) || !groupParam) {
    redirect("/kana");
  }

  const groups = groupParam
    .split(",")
    .map((group) => group.trim())
    .filter((group) =>
      validGroups.has(group as KanaSelectionKey),
    ) as KanaSelectionKey[];

  if (groups.length === 0) {
    redirect("/kana");
  }

  const entries = getKanaEntries(script as KanaScript, groups);

  if (entries.length === 0) {
    redirect("/kana");
  }

  const cards: Card[] = entries.map((entry) => ({
    type: "vocab" as const,
    front: entry.kana,
    back: entry.romaji,
  }));

  const parsedBatch = Number(batchParam);
  const batchSize = validBatchSizes.has(parsedBatch as KanaBatchSize)
    ? (parsedBatch as KanaBatchSize)
    : 1;

  const shouldShuffle = shuffleParam !== "false";
  const mode: "mc" | "typing" = modeParam === "typing" ? "typing" : "mc";
  const typingDifficulty: "easy" | "hard" =
    typingDifficultyParam === "hard" ? "hard" : "easy";

  const title = mode === "typing" ? "Type what you read" : "Interactive Learning";
  const subtitle =
    mode === "typing"
      ? "Wrong answers gain +2 required corrects and get shuffled back in."
      : "Select the correct romaji reading for each character.";

  return (
    <PageShell eyebrow="Kana session" title={title} subtitle={subtitle}>
      <KanaSessionRenderer
        script={script as KanaScript}
        groups={groups}
        cards={cards}
        batchSize={batchSize}
        shuffle={shouldShuffle}
        mode={mode}
        typingDifficulty={typingDifficulty}
      />
    </PageShell>
  );
}
