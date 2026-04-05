"use client";

import Link from "next/link";
import { useState } from "react";

import type { CardType, Lesson } from "@/lib/types";
import { getMasteryPercent, getSubDeckAccuracy } from "@/lib/srs";

type SubDeckGridProps = {
  lesson: Lesson;
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

type SubDeckStats = Record<string, { mastery: number; accuracy: number }>;

export function SubDeckGrid({ lesson }: SubDeckGridProps) {
  const [stats] = useState<SubDeckStats>(() => {
    if (typeof window === "undefined") return {};
    const result: SubDeckStats = {};
    for (const sd of lesson.subDecks) {
      result[sd.id] = {
        mastery: getMasteryPercent(sd.id, sd.cards.length),
        accuracy: getSubDeckAccuracy(sd.id, sd.cards.length),
      };
    }
    return result;
  });

  return (
    <section className="space-y-4">
      <Link
        href={`/decks/${lesson.id}/all`}
        className="group flex items-center justify-center gap-3 rounded-2xl btn-primary-gradient px-6 py-4 text-white shadow-[0_8px_24px_rgba(0,36,70,0.12)] transition-all hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg"
      >
        <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span className="text-sm font-bold uppercase tracking-[0.15em]">
          Study all sub-decks
        </span>
        <svg className="w-4 h-4 text-white/60 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </Link>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {lesson.subDecks.map((subDeck) => {
          const primaryType = getDeckPrimaryType(subDeck.cards);
          const mastery = stats[subDeck.id]?.mastery ?? 0;
          const accuracy = stats[subDeck.id]?.accuracy ?? 0;

          return (
            <Link
              key={subDeck.id}
              href={`/decks/${lesson.id}/${subDeck.id}`}
              className="group rounded-lg bg-surface-lowest p-4 shadow-[0_12px_32px_rgba(0,36,70,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,36,70,0.12)]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-primary">
                    {subDeck.cards.length} cards
                  </p>
                  <h3 className="mt-1 truncate font-display text-xl text-foreground">
                    {subDeck.title}
                  </h3>
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-low text-sm text-primary">
                  {typeIcons[primaryType]}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-3 text-xs text-on-surface-variant">
                <span>{mastery}% mastered</span>
                {accuracy > 0 && <span>&middot; {accuracy}% accuracy</span>}
              </div>

              <div className="mt-2 h-1 overflow-hidden rounded-sm bg-secondary-container">
                <div
                  className="h-full rounded-sm bg-primary transition-all duration-500"
                  style={{ width: `${mastery}%` }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
