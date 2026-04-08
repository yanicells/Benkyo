import lessonsData from "@/data/lessons.json";
import { PageShell } from "@/components/shared/page-shell";
import { KanjiDeckGrid } from "@/components/decks/kanji-deck-grid";
import { getKanjiSubDecks } from "@/lib/kanji";
import type { LessonsData } from "@/lib/types";

export default function KanjiDeckPage() {
  const lessons = (lessonsData as unknown as LessonsData).lessons;
  const entries = getKanjiSubDecks(lessons);
  const totalCards = entries.reduce((sum, e) => sum + e.subDeck.cards.length, 0);

  return (
    <PageShell
      eyebrow="Kanji"
      title="Kanji Decks"
      subtitle={`${entries.length} sub-decks · ${totalCards} kanji cards across all lessons`}
      backHref="/decks"
      backLabel="All Lessons"
    >
      <KanjiDeckGrid entries={entries} />
    </PageShell>
  );
}
