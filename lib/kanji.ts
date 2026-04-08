import type { Lesson, SubDeck } from "@/lib/types";

const KANJI_SUBDECK_PATTERN = /^(kanji-intro|lesson-\d+-kanji)$/;

export type KanjiSubDeckEntry = {
  lessonId: string;
  lessonTitle: string;
  subDeck: SubDeck;
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

export function getAllKanjiCards(lessons: Lesson[]) {
  const entries = getKanjiSubDecks(lessons);
  return entries.flatMap((e) => e.subDeck.cards);
}
