import type { Lesson, SubDeck } from "@/lib/types";

const KANJI_SUBDECK_PATTERN =
  /^(kanji-intro|lesson-\d+-kanji|jlpt-n[45]-kanji-part-\d+)$/;

export type KanjiSubDeckEntry = {
  lessonId: string;
  lessonTitle: string;
  subDeck: SubDeck;
};

export type KanjiLessonGroup = {
  lessonId: string;
  lessonTitle: string;
  entries: KanjiSubDeckEntry[];
  totalCards: number;
};

export function getKanjiSubDecks(lessons: Lesson[]): KanjiSubDeckEntry[] {
  const result: KanjiSubDeckEntry[] = [];
  for (const lesson of lessons) {
    for (const sd of lesson.subDecks) {
      if (KANJI_SUBDECK_PATTERN.test(sd.id)) {
        result.push({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          subDeck: sd,
        });
      }
    }
  }
  return result;
}

// Split kanji entries into individually-displayed subdecks (Genki kanji) and
// grouped lesson cards (JLPT proficiency decks) that expand into their parts
// when clicked.
export function getKanjiDisplayGroups(lessons: Lesson[]): {
  individual: KanjiSubDeckEntry[];
  groups: KanjiLessonGroup[];
} {
  const all = getKanjiSubDecks(lessons);
  const individual: KanjiSubDeckEntry[] = [];
  const groupMap = new Map<string, KanjiLessonGroup>();

  for (const entry of all) {
    if (entry.lessonId.startsWith("jlpt-")) {
      let g = groupMap.get(entry.lessonId);
      if (!g) {
        g = {
          lessonId: entry.lessonId,
          lessonTitle: entry.lessonTitle,
          entries: [],
          totalCards: 0,
        };
        groupMap.set(entry.lessonId, g);
      }
      g.entries.push(entry);
      g.totalCards += entry.subDeck.cards.length;
    } else {
      individual.push(entry);
    }
  }

  return { individual, groups: Array.from(groupMap.values()) };
}

export function getAllKanjiCards(lessons: Lesson[]) {
  const entries = getKanjiSubDecks(lessons);
  return entries.flatMap((e) => e.subDeck.cards);
}
