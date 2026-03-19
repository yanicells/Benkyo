import type {
  CardSRS,
  SRSRating,
  DailyStats,
  BenkyoSettings,
  StreakData,
  Lesson,
  Card,
} from "@/lib/types";

// --- Storage keys ---
const SRS_KEY = "benkyou-srs-data";
const DAILY_STATS_KEY = "benkyou-daily-stats";
const SETTINGS_KEY = "benkyou-settings";
const STREAK_KEY = "benkyou-streak";

// --- Helpers ---
function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded — silently fail
  }
}

// --- SRS Data ---
export function getAllSRS(): Record<string, CardSRS> {
  return safeGet<Record<string, CardSRS>>(SRS_KEY, {});
}

export function getCardSRS(cardId: string): CardSRS | null {
  const all = getAllSRS();
  return all[cardId] ?? null;
}

function defaultCardSRS(): CardSRS {
  return {
    ease: 2.5,
    interval: 0,
    dueDate: todayISO(),
    repetitions: 0,
    lastReview: todayISO(),
    totalReviews: 0,
    totalCorrect: 0,
  };
}

export function makeCardId(subDeckId: string, cardIndex: number): string {
  return `${subDeckId}:${cardIndex}`;
}

// --- SM-2 Algorithm ---
export function reviewCard(cardId: string, rating: SRSRating): void {
  const all = getAllSRS();
  const card = all[cardId] ?? defaultCardSRS();

  card.totalReviews += 1;
  if (rating >= 2) card.totalCorrect += 1;
  card.lastReview = todayISO();

  if (rating < 2) {
    // Again (0) or Hard (1)
    card.repetitions = 0;
    card.interval = 1;
    card.ease = Math.max(1.3, card.ease - 0.2);
  } else {
    // Good (2) or Easy (3)
    if (card.repetitions === 0) {
      card.interval = 1;
    } else if (card.repetitions === 1) {
      card.interval = 3;
    } else {
      card.interval = Math.round(card.interval * card.ease);
    }

    if (rating === 3) {
      card.ease += 0.15;
      card.interval = Math.round(card.interval * 1.3);
    }

    card.repetitions += 1;
  }

  const due = new Date();
  due.setDate(due.getDate() + card.interval);
  card.dueDate = due.toISOString().slice(0, 10);

  all[cardId] = card;
  safeSet(SRS_KEY, all);
}

// --- Due Cards ---
export type DueCard = {
  card: Card;
  cardId: string;
  subDeckId: string;
  subDeckTitle: string;
  lessonTitle: string;
};

export function getDueCards(lessons: Lesson[]): DueCard[] {
  const all = getAllSRS();
  const today = todayISO();
  const due: DueCard[] = [];

  for (const lesson of lessons) {
    for (const subDeck of lesson.subDecks) {
      for (let i = 0; i < subDeck.cards.length; i++) {
        const cardId = makeCardId(subDeck.id, i);
        const srs = all[cardId];
        if (srs && srs.dueDate <= today) {
          due.push({
            card: subDeck.cards[i],
            cardId,
            subDeckId: subDeck.id,
            subDeckTitle: subDeck.title,
            lessonTitle: lesson.title,
          });
        }
      }
    }
  }

  return due;
}

// --- Mastery helpers ---
export function getMasteryPercent(subDeckId: string, cardCount: number): number {
  if (cardCount === 0) return 0;
  const all = getAllSRS();
  let mastered = 0;
  for (let i = 0; i < cardCount; i++) {
    const srs = all[makeCardId(subDeckId, i)];
    if (srs && srs.interval >= 21) mastered++;
  }
  return Math.round((mastered / cardCount) * 100);
}

export function getLessonMastery(lesson: Lesson): number {
  let total = 0;
  let mastered = 0;
  const all = getAllSRS();
  for (const subDeck of lesson.subDecks) {
    for (let i = 0; i < subDeck.cards.length; i++) {
      total++;
      const srs = all[makeCardId(subDeck.id, i)];
      if (srs && srs.interval >= 21) mastered++;
    }
  }
  return total === 0 ? 0 : Math.round((mastered / total) * 100);
}

export function getSubDeckAccuracy(subDeckId: string, cardCount: number): number {
  const all = getAllSRS();
  let reviews = 0;
  let correct = 0;
  for (let i = 0; i < cardCount; i++) {
    const srs = all[makeCardId(subDeckId, i)];
    if (srs) {
      reviews += srs.totalReviews;
      correct += srs.totalCorrect;
    }
  }
  return reviews === 0 ? 0 : Math.round((correct / reviews) * 100);
}

// --- Daily Stats ---
export function getAllDailyStats(): Record<string, DailyStats> {
  return safeGet<Record<string, DailyStats>>(DAILY_STATS_KEY, {});
}

export function getTodayStats(): DailyStats {
  const all = getAllDailyStats();
  return all[todayISO()] ?? { reviewed: 0, correct: 0, timeSpentSeconds: 0 };
}

export function recordDailyReview(correct: boolean, timeSeconds: number): void {
  const all = getAllDailyStats();
  const today = todayISO();
  const stats = all[today] ?? { reviewed: 0, correct: 0, timeSpentSeconds: 0 };
  stats.reviewed += 1;
  if (correct) stats.correct += 1;
  stats.timeSpentSeconds += timeSeconds;
  all[today] = stats;
  safeSet(DAILY_STATS_KEY, all);
}

// --- Streak ---
export function getStreak(): StreakData {
  return safeGet<StreakData>(STREAK_KEY, { current: 0, lastDate: "" });
}

export function updateStreak(): void {
  const streak = getStreak();
  const today = todayISO();

  if (streak.lastDate === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayISO = yesterday.toISOString().slice(0, 10);

  if (streak.lastDate === yesterdayISO) {
    streak.current += 1;
  } else if (streak.lastDate !== today) {
    streak.current = 1;
  }
  streak.lastDate = today;
  safeSet(STREAK_KEY, streak);
}

// --- Settings ---
export function getSettings(): BenkyoSettings {
  return safeGet<BenkyoSettings>(SETTINGS_KEY, { dailyGoal: 20 });
}

export function saveSettings(settings: BenkyoSettings): void {
  safeSet(SETTINGS_KEY, settings);
}

// --- Export / Import ---
export function exportAllData(): string {
  return JSON.stringify({
    srs: getAllSRS(),
    dailyStats: getAllDailyStats(),
    streak: getStreak(),
    settings: getSettings(),
    exportedAt: new Date().toISOString(),
  });
}

export function importData(json: string): void {
  const data = JSON.parse(json);

  if (data.srs) {
    const current = getAllSRS();
    const incoming = data.srs as Record<string, CardSRS>;
    for (const [id, card] of Object.entries(incoming)) {
      const existing = current[id];
      if (!existing || card.lastReview > existing.lastReview) {
        current[id] = card;
      }
    }
    safeSet(SRS_KEY, current);
  }

  if (data.dailyStats) {
    const current = getAllDailyStats();
    const incoming = data.dailyStats as Record<string, DailyStats>;
    for (const [date, stats] of Object.entries(incoming)) {
      if (!current[date] || stats.reviewed > current[date].reviewed) {
        current[date] = stats;
      }
    }
    safeSet(DAILY_STATS_KEY, current);
  }

  if (data.streak) {
    const current = getStreak();
    const incoming = data.streak as StreakData;
    if (incoming.lastDate > current.lastDate) {
      safeSet(STREAK_KEY, incoming);
    }
  }

  if (data.settings) {
    safeSet(SETTINGS_KEY, data.settings);
  }
}

export function resetAllProgress(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SRS_KEY);
  localStorage.removeItem(DAILY_STATS_KEY);
  localStorage.removeItem(STREAK_KEY);
}

// --- Stats aggregation ---
export function getLifetimeStats(lessons: Lesson[]) {
  const all = getAllSRS();
  let totalReviews = 0;
  let totalCorrect = 0;
  let mastered = 0;
  let totalCards = 0;

  for (const lesson of lessons) {
    for (const subDeck of lesson.subDecks) {
      for (let i = 0; i < subDeck.cards.length; i++) {
        totalCards++;
        const srs = all[makeCardId(subDeck.id, i)];
        if (srs) {
          totalReviews += srs.totalReviews;
          totalCorrect += srs.totalCorrect;
          if (srs.interval >= 21) mastered++;
        }
      }
    }
  }

  return { totalReviews, totalCorrect, mastered, totalCards };
}

export function getWeakCards(lessons: Lesson[], limit = 10) {
  const all = getAllSRS();
  const weak: {
    card: Card;
    cardId: string;
    subDeckTitle: string;
    accuracy: number;
    lastReview: string;
  }[] = [];

  for (const lesson of lessons) {
    for (const subDeck of lesson.subDecks) {
      for (let i = 0; i < subDeck.cards.length; i++) {
        const cardId = makeCardId(subDeck.id, i);
        const srs = all[cardId];
        if (srs && srs.totalReviews >= 2) {
          weak.push({
            card: subDeck.cards[i],
            cardId,
            subDeckTitle: subDeck.title,
            accuracy: Math.round((srs.totalCorrect / srs.totalReviews) * 100),
            lastReview: srs.lastReview,
          });
        }
      }
    }
  }

  weak.sort((a, b) => a.accuracy - b.accuracy);
  return weak.slice(0, limit);
}

export function getLast30DaysAccuracy(): { date: string; accuracy: number }[] {
  const all = getAllDailyStats();
  const result: { date: string; accuracy: number }[] = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const stats = all[dateStr];
    if (stats && stats.reviewed > 0) {
      result.push({
        date: dateStr,
        accuracy: Math.round((stats.correct / stats.reviewed) * 100),
      });
    }
  }

  return result;
}
