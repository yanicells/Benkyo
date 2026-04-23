import lessonsData from "@/data/lessons.json";
import { PageShell } from "@/components/shared/page-shell";
import { KanjiDeckGrid } from "@/components/decks/kanji-deck-grid";
import { getKanjiDisplayGroups, getKanjiSubDecks } from "@/lib/kanji";
import type { LessonsData } from "@/lib/types";

export default function KanjiDeckPage() {
  const lessons = (lessonsData as unknown as LessonsData).lessons;
  const allEntries = getKanjiSubDecks(lessons);
  const { individual, groups } = getKanjiDisplayGroups(lessons);
  const totalCards = allEntries.reduce(
    (sum, e) => sum + e.subDeck.cards.length,
    0,
  );
  const totalDisplayItems = individual.length + groups.length;

  return (
    <PageShell
      eyebrow="Kanji"
      title="Kanji Decks"
      subtitle={`${totalDisplayItems} decks · ${totalCards} kanji cards`}
      tightTop
      backHref="/decks"
      backLabel="All Lessons"
    >
      <KanjiDeckGrid
        entries={allEntries}
        individual={individual}
        groups={groups}
      />
    </PageShell>
  );
}
