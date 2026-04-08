"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

import type { KanjiSubDeckEntry } from "@/lib/kanji";
import {
  getMasteryPercent,
  getSubDeckReviewedPercent,
  getSubDeckAccuracy,
  getAllSRS,
  makeCardId,
  subscribeToStudyData,
  getStudyDataRevision,
} from "@/lib/srs";

type KanjiDeckGridProps = {
  entries: KanjiSubDeckEntry[];
};

const subscribeNoop = () => () => {};

export function KanjiDeckGrid({ entries }: KanjiDeckGridProps) {
  const isHydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const dataRevision = useSyncExternalStore(
    subscribeToStudyData,
    getStudyDataRevision,
    () => -1,
  );

  const globalStats = useMemo(() => {
    if (!isHydrated || dataRevision < 0)
      return { masteryPercent: 0, reviewedPercent: 0, mastered: 0, reviewed: 0, total: 0 };

    const all = getAllSRS();
    let total = 0;
    let mastered = 0;
    let reviewed = 0;
    for (const entry of entries) {
      for (let i = 0; i < entry.subDeck.cards.length; i++) {
        total++;
        const srs = all[makeCardId(entry.subDeck.id, i)];
        if (srs) {
          if (srs.totalReviews > 0) reviewed++;
          if (srs.interval >= 21) mastered++;
        }
      }
    }
    return {
      masteryPercent: total === 0 ? 0 : Math.round((mastered / total) * 100),
      reviewedPercent: total === 0 ? 0 : Math.round((reviewed / total) * 100),
      mastered,
      reviewed,
      total,
    };
  }, [isHydrated, dataRevision, entries]);

  const subDeckStats = useMemo(() => {
    if (dataRevision < 0) return {} as Record<string, { mastery: number; reviewed: number; accuracy: number }>;
    const result: Record<string, { mastery: number; reviewed: number; accuracy: number }> = {};
    for (const entry of entries) {
      result[entry.subDeck.id] = {
        mastery: getMasteryPercent(entry.subDeck.id, entry.subDeck.cards.length),
        reviewed: getSubDeckReviewedPercent(entry.subDeck.id, entry.subDeck.cards.length),
        accuracy: getSubDeckAccuracy(entry.subDeck.id, entry.subDeck.cards.length),
      };
    }
    return result;
  }, [entries, dataRevision]);

  const totalCards = entries.reduce((sum, e) => sum + e.subDeck.cards.length, 0);

  return (
    <div className="flex flex-col gap-8 pb-32 sm:pb-36">
      {/* Overall kanji progress */}
      <div className="rounded-2xl bg-surface-lowest shadow-[0_4px_20px_rgba(0,14,33,0.04)] p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-on-surface-variant">
            Kanji Progress
          </p>
          <p className="text-[11px] text-on-surface-variant">
            <span className="font-semibold text-primary">
              {globalStats.masteryPercent}% mastery
            </span>
            <span className="px-1 text-on-surface-variant/40">/</span>
            <span className="font-semibold text-amber-700">
              {globalStats.reviewedPercent}% reviewed
            </span>
          </p>
        </div>

        <div className="h-2 rounded-full bg-secondary-container overflow-hidden mb-2">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{ width: `${globalStats.masteryPercent}%` }}
          />
        </div>
        <div className="h-2 rounded-full bg-secondary-container overflow-hidden mb-3">
          <div
            className="h-full rounded-full bg-amber-400 transition-all duration-700"
            style={{ width: `${globalStats.reviewedPercent}%` }}
          />
        </div>

        <p className="text-xs text-on-surface-variant">
          {globalStats.reviewed === 0
            ? `${totalCards} kanji cards across ${entries.length} decks. Start studying to track progress.`
            : `${globalStats.mastered} of ${globalStats.total} kanji mastered · ${globalStats.reviewed} studied`}
        </p>
      </div>

      {/* Sub-deck grid */}
      <div className="grid gap-3 [@media(min-width:520px)]:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => {
          const mastery = subDeckStats[entry.subDeck.id]?.mastery ?? 0;
          const reviewed = subDeckStats[entry.subDeck.id]?.reviewed ?? 0;
          const accuracy = subDeckStats[entry.subDeck.id]?.accuracy ?? 0;

          return (
            <Link
              key={entry.subDeck.id}
              href={`/decks/${entry.lessonId}/${entry.subDeck.id}`}
              className="group rounded-lg bg-surface-lowest p-3.5 shadow-[0_12px_32px_rgba(0,36,70,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,36,70,0.12)] sm:p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
                    {entry.subDeck.cards.length} cards
                  </p>
                  <h3 className="mt-1 truncate font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">
                    {entry.subDeck.title}
                  </h3>
                  <p className="mt-0.5 text-[10px] text-on-surface-variant truncate">
                    {entry.lessonTitle}
                  </p>
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-low text-sm text-primary font-japanese-display">
                  漢
                </span>
              </div>

              <div className="mt-3 flex items-center gap-3 text-xs text-secondary">
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

      {/* Sticky bottom bar — Study all kanji CTA */}
      <div className="fixed bottom-16 left-0 right-0 lg:bottom-0 lg:left-72 z-30 bg-surface/95 backdrop-blur-md border-t border-outline-variant/10">
        <div className="mx-auto w-full max-w-4xl px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 sm:px-8">
          <Link
            href="/decks/kanji/session"
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
              Study all kanji
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
