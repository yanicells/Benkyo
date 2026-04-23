"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import type { KanjiLessonGroup, KanjiSubDeckEntry } from "@/lib/kanji";
import { CardPreviewList } from "@/components/decks/card-preview-list";
import type { CardFilter, StudyMode } from "@/lib/types";
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
  individual: KanjiSubDeckEntry[];
  groups: KanjiLessonGroup[];
};

const subscribeNoop = () => () => {};

type FilterCounts = {
  all: number;
  new: number;
  learning: number;
  mastered: number;
};

const filterOptions: { value: CardFilter; label: string }[] = [
  { value: "all", label: "All Cards" },
  { value: "new", label: "New" },
  { value: "learning", label: "Learning" },
  { value: "mastered", label: "Mastered" },
];

function KanjiSessionModal({
  entries,
  onClose,
}: {
  entries: KanjiSubDeckEntry[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<StudyMode>("flashcard");
  const [cardFilter, setCardFilter] = useState<CardFilter>("all");
  const dataRevision = useSyncExternalStore(
    subscribeToStudyData,
    getStudyDataRevision,
    () => -1,
  );

  const totalCards = entries.reduce(
    (sum, e) => sum + e.subDeck.cards.length,
    0,
  );
  const estimatedMinutes = Math.max(1, Math.round((totalCards * 5) / 60));

  const filterCounts = useMemo((): FilterCounts => {
    if (dataRevision < 0) {
      return { all: totalCards, new: totalCards, learning: 0, mastered: 0 };
    }
    const allSRS = getAllSRS();
    let newCount = 0;
    let learning = 0;
    let mastered = 0;
    for (const entry of entries) {
      for (let i = 0; i < entry.subDeck.cards.length; i++) {
        const srs = allSRS[makeCardId(entry.subDeck.id, i)];
        if (!srs || srs.totalReviews === 0) {
          newCount++;
        } else if (srs.interval >= 21) {
          mastered++;
        } else {
          learning++;
        }
      }
    }
    return { all: totalCards, new: newCount, learning, mastered };
  }, [dataRevision, entries, totalCards]);

  // Derive the effective filter during render: if the user's picked filter no
  // longer has any cards (data changed), fall back to "all" without a state sync.
  const effectiveFilter: CardFilter =
    cardFilter !== "all" && filterCounts[cardFilter] === 0 ? "all" : cardFilter;

  const availableFilterOptions = filterOptions.filter(
    (opt) => opt.value === "all" || filterCounts[opt.value] > 0,
  );

  const startSession = () => {
    const deckIds = entries.map((e) => e.subDeck.id).join(",");
    const params = new URLSearchParams({
      mode,
      decks: deckIds,
      ...(effectiveFilter !== "all" && { filter: effectiveFilter }),
    });
    router.push(`/decks/kanji/session?${params.toString()}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex max-h-[75vh] sm:max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-surface-lowest shadow-[0_24px_64px_rgba(0,14,33,0.2)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10 shrink-0">
          <h3 className="font-display text-lg font-bold text-foreground">
            Kanji Session
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-low transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-5">
          <div className="rounded-xl border-2 border-primary/20 bg-surface-lowest px-5 py-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="font-display text-2xl font-bold text-foreground">
                  {totalCards}
                </p>
                <p className="text-[10px] uppercase tracking-[0.12em] text-on-surface-variant mt-0.5">
                  cards
                </p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-foreground">
                  ~{estimatedMinutes}
                </p>
                <p className="text-[10px] uppercase tracking-[0.12em] text-on-surface-variant mt-0.5">
                  min
                </p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-foreground">
                  {entries.length}
                </p>
                <p className="text-[10px] uppercase tracking-[0.12em] text-on-surface-variant mt-0.5">
                  deck{entries.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-3">
              Study mode
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { value: "flashcard" as StudyMode, label: "Flashcard" },
                  {
                    value: "multiple-choice" as StudyMode,
                    label: "Multiple Choice",
                  },
                ] as const
              ).map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMode(m.value)}
                  className={`rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
                    mode === m.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-primary/20 bg-surface-lowest text-foreground hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-3">
              Cards
            </p>
            <div className="grid grid-cols-2 gap-2">
              {availableFilterOptions.map((opt) => {
                const count = filterCounts[opt.value];
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCardFilter(opt.value)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
                      cardFilter === opt.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-primary/20 bg-surface-lowest text-foreground hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  >
                    {opt.label}
                    <span
                      className={`text-xs ${
                        cardFilter === opt.value
                          ? "text-primary/70"
                          : "text-on-surface-variant"
                      }`}
                    >
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        <div className="px-6 py-4 border-t border-outline-variant/10 shrink-0">
          <button
            type="button"
            disabled={filterCounts[cardFilter] === 0}
            onClick={startSession}
            className="w-full btn-primary-gradient rounded-xl py-4 text-white font-bold text-base shadow-[0_8px_24px_rgba(0,36,70,0.15)] transition hover:opacity-90 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Start Session
            {filterCounts[cardFilter] > 0
              ? ` · ${filterCounts[cardFilter]} cards`
              : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

export function KanjiDeckGrid({
  entries,
  individual,
  groups,
}: KanjiDeckGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionOpen, setSessionOpen] = useState(false);
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
      return {
        masteryPercent: 0,
        reviewedPercent: 0,
        mastered: 0,
        reviewed: 0,
        total: 0,
      };

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
    if (dataRevision < 0)
      return {} as Record<
        string,
        { mastery: number; reviewed: number; accuracy: number }
      >;
    const result: Record<
      string,
      { mastery: number; reviewed: number; accuracy: number }
    > = {};
    for (const entry of entries) {
      result[entry.subDeck.id] = {
        mastery: getMasteryPercent(
          entry.subDeck.id,
          entry.subDeck.cards.length,
        ),
        reviewed: getSubDeckReviewedPercent(
          entry.subDeck.id,
          entry.subDeck.cards.length,
        ),
        accuracy: getSubDeckAccuracy(
          entry.subDeck.id,
          entry.subDeck.cards.length,
        ),
      };
    }
    return result;
  }, [entries, dataRevision]);

  const totalCards = entries.reduce(
    (sum, e) => sum + e.subDeck.cards.length,
    0,
  );
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return null;

    return entries.flatMap((entry) =>
      entry.subDeck.cards.filter(
        (card) =>
          card.front.toLowerCase().includes(q) ||
          card.back.toLowerCase().includes(q) ||
          (card.romaji && card.romaji.toLowerCase().includes(q)),
      ),
    );
  }, [entries, searchQuery]);

  return (
    <div className="flex flex-col gap-3 pb-32 sm:gap-8 sm:pb-36">
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

      {/* Search bar */}
      <div className="sticky top-26 lg:top-27.5 z-20 -mx-4 bg-surface/95 px-4 py-1.5 backdrop-blur-md sm:-mx-8 sm:px-8 sm:py-2">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-on-surface-variant/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search kanji cards..."
            className="w-full rounded-xl border border-outline-variant/20 bg-surface-lowest py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-on-surface-variant/50 shadow-sm transition-colors focus:border-primary/40 focus:outline-none focus:ring-0"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-low transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Search results */}
      {searchResults &&
        (searchResults.length === 0 ? (
          <div className="rounded-2xl bg-surface-lowest p-5 shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
            <p className="text-sm text-on-surface-variant py-4 text-center">
              No kanji cards match your search.
            </p>
          </div>
        ) : (
          <CardPreviewList
            cards={searchResults}
            title={`${searchResults.length} result${searchResults.length !== 1 ? "s" : ""}`}
            maxVisible={30}
            preserveNewlines
          />
        ))}

      {/* Group cards (JLPT proficiency) */}
      {!searchResults && groups.length > 0 && (
        <div className="grid gap-3 [@media(min-width:520px)]:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => {
            const masterySum = group.entries.reduce(
              (s, e) =>
                s + (subDeckStats[e.subDeck.id]?.mastery ?? 0) *
                  e.subDeck.cards.length,
              0,
            );
            const reviewedSum = group.entries.reduce(
              (s, e) =>
                s + (subDeckStats[e.subDeck.id]?.reviewed ?? 0) *
                  e.subDeck.cards.length,
              0,
            );
            const mastery = group.totalCards
              ? Math.round(masterySum / group.totalCards)
              : 0;
            const reviewed = group.totalCards
              ? Math.round(reviewedSum / group.totalCards)
              : 0;
            return (
              <Link
                key={group.lessonId}
                href={`/decks/${group.lessonId}?from=kanji`}
                className="group rounded-lg bg-surface-lowest p-3.5 shadow-[0_12px_32px_rgba(0,36,70,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,36,70,0.12)] sm:p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
                      {group.entries.length} parts · {group.totalCards} cards
                    </p>
                    <h3 className="mt-1 truncate font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">
                      {group.lessonTitle}
                    </h3>
                    <p className="mt-0.5 text-[10px] text-on-surface-variant truncate">
                      Tap to view parts
                    </p>
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm text-primary font-japanese-display">
                    漢
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-secondary">
                  <span className="text-primary">{mastery}% mastery</span>
                  <span>&middot;</span>
                  <span className="text-amber-700">{reviewed}% reviewed</span>
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
      )}

      {/* Individual sub-deck grid (Genki kanji) */}
      {!searchResults && (
        <div className="grid gap-3 [@media(min-width:520px)]:grid-cols-2 lg:grid-cols-3">
          {individual.map((entry) => {
            const mastery = subDeckStats[entry.subDeck.id]?.mastery ?? 0;
            const reviewed = subDeckStats[entry.subDeck.id]?.reviewed ?? 0;
            const accuracy = subDeckStats[entry.subDeck.id]?.accuracy ?? 0;

            return (
              <Link
                key={entry.subDeck.id}
                href={`/decks/${entry.lessonId}/${entry.subDeck.id}?from=kanji`}
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
      )}

      {/* Sticky bottom bar — Study all kanji CTA */}
      <div className="fixed bottom-16 left-0 right-0 lg:bottom-0 lg:left-72 z-30 bg-surface/95 backdrop-blur-md border-t border-outline-variant/10">
        <div className="mx-auto w-full max-w-4xl px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 sm:px-8">
          <button
            type="button"
            onClick={() => setSessionOpen(true)}
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
            <span className="uppercase tracking-[0.15em]">Study all kanji</span>
          </button>
        </div>
      </div>

      {sessionOpen && (
        <KanjiSessionModal
          entries={entries}
          onClose={() => setSessionOpen(false)}
        />
      )}
    </div>
  );
}
