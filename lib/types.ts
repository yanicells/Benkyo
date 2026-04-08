// Card types
export type CardType =
  | "vocab"
  | "grammar"
  | "fill-in"
  | "conjugation"
  | "translate"
  | "culture";

export type Card = {
  type: CardType;
  front: string;
  back: string;
  romaji?: string;
  hint?: string;
};

export type SubDeck = {
  id: string;
  title: string;
  cards: Card[];
};

export type LessonMeta = {
  notes: string;
  cheatSheet: string[];
  youtubeUrl?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  estimatedMinutes?: number;
  tags?: string[];
  tips?: string[];
};

export type Lesson = {
  id: string;
  title: string;
  meta?: LessonMeta;
  subDecks: SubDeck[];
  order?: number;
  prerequisiteIds?: string[];
};

export type LessonsData = {
  version: string;
  schema: { description: string; types: Record<string, string> };
  lessons: Lesson[];
};

// Study modes (typing removed in v2)
export type StudyMode = "flashcard" | "multiple-choice";

export type FlipSetting = "jp-to-en" | "en-to-jp";

export type SessionCard = {
  card: Card;
  correctsNeeded: number;
};

// SRS types
export type SRSRating = 0 | 1 | 2 | 3; // Again, Hard, Good, Easy

export type CardSRS = {
  ease: number;
  interval: number;
  dueDate: string;
  repetitions: number;
  lastReview: string;
  totalReviews: number;
  totalCorrect: number;
};

export type DailyStats = {
  reviewed: number;
  correct: number;
  timeSpentSeconds: number;
};

export type BenkyoSettings = {
  dailyGoal: number;
};

export type StreakData = {
  current: number;
  lastDate: string;
};

// Kana types (unchanged)
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

// Reading practice types
export type ReadingDifficulty = "simple" | "intermediate" | "hard";

export type ReadingPassage = {
  id: string;
  title: string;
  difficulty: ReadingDifficulty;
  sourceLesson: string;
  passage: string;
  translation: string;
  vocabularyHighlights: {
    word: string;
    reading?: string;
    meaning: string;
  }[];
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
};

export type ReadingsData = {
  version: string;
  passages: ReadingPassage[];
};

// Reading v2 — story-based structure

export type ReadingStoryMeta = {
  notes: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  cheatSheet: string[];
  tags?: string[];
  tips?: string[];
  sourceLessons: string[];
};

export type ReadingStory = {
  id: string;
  title: string;
  difficulty: ReadingDifficulty;
  meta: ReadingStoryMeta;
  passages: {
    passage: string;
    translation: string;
    vocabularyHighlights: {
      word: string;
      reading?: string;
      meaning: string;
    }[];
  }[];
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
};

export type ReadingDifficultyGroup = {
  key: ReadingDifficulty;
  label: string;
  description: string;
  icon: string;
  stories: ReadingStory[];
};

export type ReadingsDataV2 = {
  version: string;
  difficulties: ReadingDifficultyGroup[];
};

export type ReadingStoryProgress = {
  completed: boolean;
  bestScore: number;
  totalQuestions: number;
  lastAttempted: string;
};

export type ReadingProgressData = Record<string, ReadingStoryProgress>;
