import lessonsData from "@/data/lessons.json";
import { PageShell } from "@/components/shared/page-shell";
import { KanaConfigForm } from "@/components/kana/kana-config-form";
import type { KanaScript, LessonsData } from "@/lib/types";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function KanaPage({ searchParams }: Props) {
  const query = await searchParams;
  const tabParam = Array.isArray(query.tab) ? query.tab[0] : query.tab;
  const initialScript: KanaScript =
    tabParam === "katakana" ? "katakana" : "hiragana";
  const initialTab =
    tabParam === "kanji" ? "kanji" : tabParam === "katakana" ? "katakana" : "hiragana";

  const lessons = (lessonsData as unknown as LessonsData).lessons;

  return (
    <PageShell
      eyebrow="Kana"
      title={initialTab === "kanji" ? "Kanji Practice" : "Kana Practice"}
      subtitle={
        initialTab === "kanji"
          ? "Review kanji characters from all lessons."
          : "Select the rows you want to drill and start a session."
      }
    >
      <KanaConfigForm
        initialScript={initialScript}
        initialTab={initialTab}
        lessons={lessons}
      />
    </PageShell>
  );
}
