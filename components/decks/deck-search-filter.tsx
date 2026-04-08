"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import type { Card, CardType, Lesson } from "@/lib/types";
import { CardPreviewList } from "@/components/decks/card-preview-list";
import { getKanjiSubDecks } from "@/lib/kanji";

type FilterTab =
  | "grouped"
  | "all"
  | "vocab"
  | "grammar"
  | "kanji"
  | "conjugation"
  | "culture";

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: "grouped", label: "Grouped" },
  { value: "all", label: "All Decks" },
  { value: "vocab", label: "Vocab" },
  { value: "grammar", label: "Grammar" },
  { value: "kanji", label: "Kanji" },
  { value: "conjugation", label: "Conjugation" },
  { value: "culture", label: "Culture" },
];

const TYPE_FILTER_MAP: Partial<Record<FilterTab, CardType>> = {
  vocab: "vocab",
  grammar: "grammar",
  conjugation: "conjugation",
  culture: "culture",
};

type DeckSearchFilterProps = {
  lessons: Lesson[];
  children: React.ReactNode;
  scope?: "global" | "lesson";
  lesson?: Lesson;
};

type SearchResult = {
  card: Card;
  lessonId: string;
  lessonTitle: string;
  subDeckId: string;
  subDeckTitle: string;
};

export function DeckSearchFilter({
  lessons,
  children,
  scope = "global",
  lesson,
}: DeckSearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("grouped");

  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return null;

    const results: SearchResult[] = [];
    const searchLessons = scope === "lesson" && lesson ? [lesson] : lessons;

    for (const l of searchLessons) {
      for (const sd of l.subDecks) {
        for (const card of sd.cards) {
          if (
            card.front.toLowerCase().includes(q) ||
            card.back.toLowerCase().includes(q) ||
            (card.romaji && card.romaji.toLowerCase().includes(q))
          ) {
            results.push({
              card,
              lessonId: l.id,
              lessonTitle: l.title,
              subDeckId: sd.id,
              subDeckTitle: sd.title,
            });
          }
        }
      }
    }
    return results;
  }, [searchQuery, lessons, scope, lesson]);

  const filteredCards = useMemo(() => {
    if (activeFilter === "grouped" || activeFilter === "all") return null;

    const searchLessons = scope === "lesson" && lesson ? [lesson] : lessons;

    if (activeFilter === "kanji") {
      const kanjiEntries = getKanjiSubDecks(searchLessons);
      return kanjiEntries.flatMap((e) => e.subDeck.cards);
    }

    const typeFilter = TYPE_FILTER_MAP[activeFilter];
    if (!typeFilter) return null;

    const cards: Card[] = [];
    for (const l of searchLessons) {
      for (const sd of l.subDecks) {
        for (const card of sd.cards) {
          if (card.type === typeFilter) {
            cards.push(card);
          }
        }
      }
    }
    return cards;
  }, [activeFilter, lessons, scope, lesson]);

  const allSubDecks = useMemo(() => {
    if (activeFilter !== "all") return null;
    const searchLessons = scope === "lesson" && lesson ? [lesson] : lessons;
    return searchLessons.flatMap((l) =>
      l.subDecks.map((sd) => ({
        lessonId: l.id,
        lessonTitle: l.title,
        subDeck: sd,
      })),
    );
  }, [activeFilter, lessons, scope, lesson]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Search bar */}
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
          placeholder="Search all cards..."
          className="w-full rounded-xl border border-outline-variant/20 bg-surface-lowest py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-on-surface-variant/50 shadow-sm transition-colors focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
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

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              setActiveFilter(tab.value);
              setSearchQuery("");
            }}
            className={`shrink-0 rounded-lg border px-3.5 py-2 text-xs font-bold transition-all ${
              activeFilter === tab.value
                ? "border-primary/35 bg-primary/[0.07] text-primary shadow-sm"
                : "border-outline-variant/20 bg-surface-lowest text-on-surface-variant hover:border-primary/20"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search results */}
      {isSearching && searchResults && (
        searchResults.length === 0 ? (
          <div className="rounded-2xl bg-surface-lowest p-5 shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
            <p className="text-sm text-on-surface-variant py-4 text-center">
              No cards match your search.
            </p>
          </div>
        ) : (
          <CardPreviewList
            cards={searchResults.map((r) => r.card)}
            title={`${searchResults.length} result${searchResults.length !== 1 ? "s" : ""}`}
            maxVisible={30}
          />
        )
      )}

      {/* Type-filtered cards */}
      {!isSearching && filteredCards && filteredCards.length > 0 && (
        <CardPreviewList
          cards={filteredCards}
          title={`${FILTER_TABS.find((t) => t.value === activeFilter)?.label ?? ""} cards`}
          maxVisible={30}
        />
      )}

      {/* All decks flat list */}
      {!isSearching && allSubDecks && (
        <div className="grid gap-3 [@media(min-width:520px)]:grid-cols-2 lg:grid-cols-3">
          {allSubDecks.map((item) => (
            <Link
              key={`${item.lessonId}-${item.subDeck.id}`}
              href={`/decks/${item.lessonId}/${item.subDeck.id}`}
              className="group rounded-lg bg-surface-lowest p-3.5 shadow-[0_12px_32px_rgba(0,36,70,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,36,70,0.12)] sm:p-4"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
                {item.subDeck.cards.length} cards
              </p>
              <h3 className="mt-1 truncate font-display text-base font-bold tracking-tight text-foreground sm:text-lg">
                {item.subDeck.title}
              </h3>
              <p className="mt-0.5 text-[10px] text-on-surface-variant truncate">
                {item.lessonTitle}
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* Default grouped view (children = LessonDeckGrid or SubDeckGrid) */}
      {!isSearching && activeFilter === "grouped" && children}
    </div>
  );
}
