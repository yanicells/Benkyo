import type { Card, SessionCard } from "@/lib/types";

const cardKey = (card: Card) => `${card.front}__${card.back}`;

function insertAt<T>(items: T[], index: number, item: T): T[] {
  return [...items.slice(0, index), item, ...items.slice(index)];
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function pickMiddleInsertIndex(restLength: number): number {
  if (restLength === 0) {
    return 0;
  }

  if (restLength === 1) {
    return 1;
  }

  const minIndex = 1;
  const maxIndex = restLength - 1;
  return Math.floor(Math.random() * (maxIndex - minIndex + 1)) + minIndex;
}

export function buildQueue(cards: Card[]): SessionCard[] {
  return shuffle(cards).map((card) => ({ card, correctsNeeded: 1 }));
}

export function buildQueueOrdered(cards: Card[]): SessionCard[] {
  return cards.map((card) => ({ card, correctsNeeded: 1 }));
}

export function answerCorrect(queue: SessionCard[]): SessionCard[] {
  if (queue.length === 0) {
    return queue;
  }

  const [current, ...rest] = queue;
  const updated: SessionCard = {
    card: current.card,
    correctsNeeded: current.correctsNeeded - 1,
  };

  if (updated.correctsNeeded <= 0) {
    return rest;
  }

  const insertIndex = pickMiddleInsertIndex(rest.length);
  return insertAt(rest, insertIndex, updated);
}

export function answerWrong(queue: SessionCard[]): SessionCard[] {
  if (queue.length === 0) {
    return queue;
  }

  const [current, ...rest] = queue;
  const updated: SessionCard = {
    card: current.card,
    correctsNeeded: current.correctsNeeded + 2,
  };
  const insertIndex = pickMiddleInsertIndex(rest.length);

  return insertAt(rest, insertIndex, updated);
}

export function isSessionComplete(queue: SessionCard[]): boolean {
  return queue.length === 0;
}

export function getWrongCards(original: Card[], queue: SessionCard[]): Card[] {
  const wrongKeys = new Set(
    queue
      .filter((entry) => entry.correctsNeeded > 1)
      .map((entry) => cardKey(entry.card)),
  );

  return original.filter((card) => wrongKeys.has(cardKey(card)));
}
