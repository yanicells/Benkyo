import type { ReadingStoryProgress, ReadingProgressData, ReadingStory } from "@/lib/types";

const READING_PROGRESS_KEY = "benkyou-reading-progress";

let readingProgressRevision = 0;
const readingProgressSubscribers = new Set<() => void>();
let storageListenerAttached = false;

function notifyReadingProgressChanged(): void {
  readingProgressRevision += 1;
  for (const subscriber of readingProgressSubscribers) {
    subscriber();
  }
}

function onStorageEvent(event: StorageEvent): void {
  if (!event.key || event.key === READING_PROGRESS_KEY) {
    notifyReadingProgressChanged();
  }
}

function ensureStorageListener(): void {
  if (typeof window === "undefined" || storageListenerAttached) return;
  window.addEventListener("storage", onStorageEvent);
  storageListenerAttached = true;
}

function cleanupStorageListener(): void {
  if (
    typeof window === "undefined" ||
    !storageListenerAttached ||
    readingProgressSubscribers.size > 0
  ) {
    return;
  }
  window.removeEventListener("storage", onStorageEvent);
  storageListenerAttached = false;
}

export function subscribeToReadingProgress(onStoreChange: () => void): () => void {
  readingProgressSubscribers.add(onStoreChange);
  ensureStorageListener();

  return () => {
    readingProgressSubscribers.delete(onStoreChange);
    cleanupStorageListener();
  };
}

export function getReadingProgressRevision(): number {
  return readingProgressRevision;
}

export function getAllReadingProgress(): ReadingProgressData {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(READING_PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as ReadingProgressData) : {};
  } catch {
    return {};
  }
}

export function getStoryProgress(storyId: string): ReadingStoryProgress | null {
  const all = getAllReadingProgress();
  return all[storyId] ?? null;
}

export function saveStoryResult(
  storyId: string,
  score: number,
  totalQuestions: number,
): void {
  const all = getAllReadingProgress();
  const existing = all[storyId];

  all[storyId] = {
    completed: true,
    bestScore: existing ? Math.max(existing.bestScore, score) : score,
    totalQuestions,
    lastAttempted: new Date().toISOString(),
  };

  localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(all));
  notifyReadingProgressChanged();
}

export function getDifficultyStats(stories: ReadingStory[]): {
  completed: number;
  total: number;
  avgScore: number;
} {
  const all = getAllReadingProgress();
  let completed = 0;
  let totalScore = 0;
  let totalQuestions = 0;

  for (const story of stories) {
    const progress = all[story.id];
    if (progress?.completed) {
      completed++;
      totalScore += progress.bestScore;
      totalQuestions += progress.totalQuestions;
    }
  }

  return {
    completed,
    total: stories.length,
    avgScore: totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0,
  };
}
