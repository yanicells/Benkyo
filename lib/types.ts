export type Card = { front: string; back: string };

export type Lesson = { id: string; title: string; cards: Card[] };

export type LessonsData = { lessons: Lesson[] };

export type StudyMode = "flashcard" | "multiple-choice" | "typing";

export type FlipSetting = "jp-to-en" | "en-to-jp";

export type SessionCard = {
  card: Card;
  correctsNeeded: number;
};

export type KanaGroup = "basic" | "dakuten" | "combo";

export type KanaScript = "hiragana" | "katakana";

export type KanaEntry = { kana: string; romaji: string };
