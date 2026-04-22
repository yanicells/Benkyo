"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

import type { CardType, Lesson } from "@/lib/types";
import {
  getMasteryPercent,
  getSubDeckReviewedPercent,
  getSubDeckAccuracy,
  subscribeToStudyData,
  getStudyDataRevision,
} from "@/lib/srs";

type SubDeckGridProps = {
  lesson: Lesson;
  basePath?: "/decks" | "/reviewer";
};

const typeIcons: Record<CardType, string> = {
  vocab: "語",
  grammar: "文",
  "fill-in": "✎",
  conjugation: "変",
  translate: "訳",
  culture: "文化",
};

function getDeckPrimaryType(cards: { type: CardType }[]): CardType {
  const counts: Partial<Record<CardType, number>> = {};
  for (const card of cards) {
    counts[card.type] = (counts[card.type] ?? 0) + 1;
  }
  let max: CardType = "vocab";
  let maxCount = 0;
  for (const [type, count] of Object.entries(counts)) {
    if (count > maxCount) {
      max = type as CardType;
      maxCount = count;
    }
  }
  return max;
}

type SubDeckStats = Record<
  string,
  { mastery: number; reviewed: number; accuracy: number }
>;

export function SubDeckGrid({ lesson, basePath = "/decks" }: SubDeckGridProps) {
  const dataRevision = useSyncExternalStore(
    subscribeToStudyData,
    getStudyDataRevision,
    () => -1,
  );

  const stats = useMemo<SubDeckStats>(() => {
    if (dataRevision < 0) return {};

    const result: SubDeckStats = {};
    for (const sd of lesson.subDecks) {
      result[sd.id] = {
        mastery: getMasteryPercent(sd.id, sd.cards.length),
        reviewed: getSubDeckReviewedPercent(sd.id, sd.cards.length),
        accuracy: getSubDeckAccuracy(sd.id, sd.cards.length),
      };
    }
    return result;
  }, [lesson, dataRevision]);

  return (
    <section className="space-y-4 pb-32 sm:pb-36">
      <div className="grid gap-3 [@media(min-width:520px)]:grid-cols-2 lg:grid-cols-3">
        {lesson.subDecks.map((subDeck) => {
          const primaryType = getDeckPrimaryType(subDeck.cards);
          const mastery = stats[subDeck.id]?.mastery ?? 0;
          const reviewed = stats[subDeck.id]?.reviewed ?? 0;
          const accuracy = stats[subDeck.id]?.accuracy ?? 0;

          return (
            <Link
              key={subDeck.id}
              href={`${basePath}/${lesson.id}/${subDeck.id}`}
              className="group rounded-lg bg-surface-lowest p-3.5 shadow-[0_12px_32px_rgba(0,36,70,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,36,70,0.12)] sm:p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
                    {subDeck.cards.length} cards
                  </p>
                  <h3 className="mt-1 truncate font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">
                    {subDeck.title}
                  </h3>
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-low text-sm text-primary">
                  {typeIcons[primaryType]}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-3 text-xs text-secondary sm:text-xs">
                <span className="text-primary">{mastery}% mastery</span>
                <span>&middot;</span>
                <span className="text-amber-700">{reviewed}% reviewed</span>
                {accuracy > 0 && <span>&middot; {accuracy}% accuracy</span>}
              </div>

              <div className="mt-2 h-1 overflow-hidden rounded-sm bg-secondary-container">
                <div
                  className="h-full rounded-sm bg-primary transition-all duration-500"
                  style={{ width: `${mastery}%` }}
                />
              </div>

              <div className="mt-1.5 h-1 overflow-hidden rounded-sm bg-secondary-container">
                <div
                  className="h-full rounded-sm bg-amber-400 transition-all duration-500"
                  style={{ width: `${reviewed}%` }}
                />
              </div>

            </Link>
          );
        })}
      </div>

      {/* Sticky bottom bar — Study all CTA */}
      <div className="fixed bottom-16 left-0 right-0 lg:bottom-0 lg:left-72 z-30 bg-surface/95 backdrop-blur-md border-t border-outline-variant/10">
        <div className="mx-auto w-full max-w-4xl px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 sm:px-8">
          <Link
            href={`${basePath}/${lesson.id}/all`}
            className="group flex w-full items-center justify-center gap-3 rounded-xl btn-primary-gradient py-3.5 text-white font-bold text-sm shadow-[0_8px_20px_rgba(0,36,70,0.15)] transition hover:opacity-90"
          >
            <svg
              className="w-5 h-5 text-white/80"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <span className="uppercase tracking-[0.15em]">
              Study all sub-decks
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
