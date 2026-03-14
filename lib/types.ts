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

export type KanaRowKey =
  | "basic-a"
  | "basic-ka"
  | "basic-sa"
  | "basic-ta"
  | "basic-na"
  | "basic-ha"
  | "basic-ma"
  | "basic-ya"
  | "basic-ra"
  | "basic-wa"
  | "dakuten-ga"
  | "dakuten-za"
  | "dakuten-da"
  | "dakuten-ba"
  | "dakuten-pa"
  | "combo-kya"
  | "combo-sha"
  | "combo-cha"
  | "combo-nya"
  | "combo-hya"
  | "combo-mya"
  | "combo-rya"
  | "combo-gya"
  | "combo-ja"
  | "combo-bya"
  | "combo-pya";

export type KanaSelectionKey = KanaGroup | KanaRowKey;

export type KanaScript = "hiragana" | "katakana";

export type KanaBatchSize = 1 | 2 | 3 | 4;

export type KanaEntry = { kana: string; romaji: string };
