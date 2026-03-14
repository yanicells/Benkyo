import { redirect } from "next/navigation";

import { PageShell } from "@/components/shared/page-shell";
import { KanaSessionRenderer } from "@/components/kana/kana-session-renderer";
import { getKanaEntries, kanaSelectionKeys } from "@/lib/kana";
import type { Card, KanaScript, KanaSelectionKey } from "@/lib/types";

type KanaSessionPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const validScripts = new Set<KanaScript>(["hiragana", "katakana"]);
const validGroups = new Set<KanaSelectionKey>(kanaSelectionKeys);

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function KanaSessionPage({
  searchParams,
}: KanaSessionPageProps) {
  const query = await searchParams;
  const script = firstParam(query.script);
  const groupParam = firstParam(query.groups);

  if (!script || !validScripts.has(script as KanaScript) || !groupParam) {
    redirect("/kana");
  }

  const groups = groupParam
    .split(",")
    .map((group) => group.trim())
    .filter((group) => validGroups.has(group as KanaSelectionKey)) as KanaSelectionKey[];

  if (groups.length === 0) {
    redirect("/kana");
  }

  const entries = getKanaEntries(script as KanaScript, groups);

  if (entries.length === 0) {
    redirect("/kana");
  }

  const cards: Card[] = entries.map((entry) => ({
    front: entry.kana,
    back: entry.romaji,
  }));

  return (
    <PageShell
      eyebrow="Kana session"
      title="Type what you read"
      subtitle="Wrong answers gain +2 required corrects and get shuffled back in."
      backHref="/kana"
    >
      <KanaSessionRenderer
        script={script as KanaScript}
        groups={groups}
        cards={cards}
      />
    </PageShell>
  );
}
