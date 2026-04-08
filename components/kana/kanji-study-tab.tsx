"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import type { Lesson, StudyMode, FlipSetting, CardFilter } from "@/lib/types";
import { getKanjiSubDecks, type KanjiSubDeckEntry } from "@/lib/kanji";
import {
  getAllSRS,
  makeCardId,
  subscribeToStudyData,
  getStudyDataRevision,
} from "@/lib/srs";

type KanjiStudyTabProps = {
  lessons: Lesson[];
};

const previewTypeLabels: Record<string, string> = {
  vocab: "Vocab",
  grammar: "Grammar",
  "fill-in": "Fill In",
  conjugation: "Conjug.",
  translate: "Translate",
  culture: "Culture",
};

type FilterCounts = { all: number; new: number; learning: number; mastered: number };

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
  const [flip, setFlip] = useState<FlipSetting>("jp-to-en");
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

  const startSession = () => {
    const deckIds = entries.map((e) => e.subDeck.id).join(",");
    const params = new URLSearchParams({
      mode,
      flip,
      decks: deckIds,
      ...(cardFilter !== "all" && { filter: cardFilter }),
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
          {/* Summary */}
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

          {/* Study mode */}
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

          {/* Card filter */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-3">
              Cards
            </p>
            <div className="grid grid-cols-2 gap-2">
              {filterOptions.map((opt) => {
                const count = filterCounts[opt.value];
                const disabled = count === 0 && opt.value !== "all";
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && setCardFilter(opt.value)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
                      disabled
                        ? "border-outline-variant/10 bg-surface-lowest text-on-surface-variant/40 cursor-not-allowed"
                        : cardFilter === opt.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-primary/20 bg-surface-lowest text-foreground hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  >
                    {opt.label}
                    <span className={`text-xs ${
                      disabled
                        ? "text-on-surface-variant/30"
                        : cardFilter === opt.value
                          ? "text-primary/70"
                          : "text-on-surface-variant"
                    }`}>
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direction */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-3">
              Direction
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { value: "jp-to-en" as FlipSetting, label: "日 → English" },
                  { value: "en-to-jp" as FlipSetting, label: "English → 日" },
                ] as const
              ).map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFlip(f.value)}
                  className={`rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
                    flip === f.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-primary/20 bg-surface-lowest text-foreground hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  {f.label}
                </button>
              ))}
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
            Start Session{filterCounts[cardFilter] > 0 ? ` · ${filterCounts[cardFilter]} cards` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

export function KanjiStudyTab({ lessons }: KanjiStudyTabProps) {
  const entries = useMemo(() => getKanjiSubDecks(lessons), [lessons]);
  const [selectedDecks, setSelectedDecks] = useState<Set<string>>(
    () => new Set(entries.map((e) => e.subDeck.id)),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionOpen, setSessionOpen] = useState(false);

  const toggleDeck = (id: string) => {
    setSelectedDecks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedEntries = useMemo(
    () => entries.filter((e) => selectedDecks.has(e.subDeck.id)),
    [entries, selectedDecks],
  );

  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();
    const results: { entry: KanjiSubDeckEntry; cardIndex: number }[] = [];
    for (const entry of entries) {
      for (let i = 0; i < entry.subDeck.cards.length; i++) {
        const card = entry.subDeck.cards[i];
        if (
          card.front.toLowerCase().includes(q) ||
          card.back.toLowerCase().includes(q) ||
          (card.romaji && card.romaji.toLowerCase().includes(q))
        ) {
          results.push({ entry, cardIndex: i });
        }
      }
    }
    return results;
  }, [entries, searchQuery]);

  const totalSelected = selectedEntries.reduce(
    (sum, e) => sum + e.subDeck.cards.length,
    0,
  );
  const stickySearchTopClass = "top-14 lg:top-16";

  return (
    <>
      <div className="space-y-6 pb-32">
        {/* Search bar */}
        <div
          className={`sticky ${stickySearchTopClass} z-10 -mx-1 rounded-xl bg-surface/95 px-1 py-1.5 backdrop-blur-md`}
        >
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
        {filteredCards && (
          <div className="rounded-2xl bg-surface-lowest p-5 shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
            <p className="text-xs uppercase tracking-[0.22em] text-primary font-bold mb-3">
              {filteredCards.length} result
              {filteredCards.length !== 1 ? "s" : ""}
            </p>
            {filteredCards.length === 0 ? (
              <p className="text-sm text-on-surface-variant py-4 text-center">
                No kanji cards match your search.
              </p>
            ) : (
              <div className="space-y-2">
                {filteredCards.map(({ entry, cardIndex }) => {
                  const card = entry.subDeck.cards[cardIndex];
                  return (
                    <div
                      key={`${entry.subDeck.id}-${cardIndex}`}
                      className="flex items-center gap-2 rounded-lg bg-surface-low px-3 py-2"
                    >
                      <span className="inline-flex h-6 w-24 shrink-0 items-center justify-center rounded-lg bg-surface-lowest px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                        {previewTypeLabels[card.type] ?? card.type}
                      </span>
                      <div className="min-w-0">
                        <p className="font-sans text-xl font-medium text-foreground">
                          {card.front}
                        </p>
                        <p className="mt-1 text-sm text-on-surface-variant">
                          {card.back}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Kanji deck selection */}
        {!filteredCards && (
          <>
            <div className="flex justify-between items-center">
              <h3 className="text-xs uppercase tracking-[0.15em] font-bold text-foreground">
                Select Kanji Decks
              </h3>
              <button
                type="button"
                onClick={() => {
                  const allIds = entries.map((e) => e.subDeck.id);
                  const allSelected = allIds.every((id) =>
                    selectedDecks.has(id),
                  );
                  setSelectedDecks(allSelected ? new Set() : new Set(allIds));
                }}
                className="text-xs font-bold text-primary hover:underline"
              >
                {entries.every((e) => selectedDecks.has(e.subDeck.id))
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            <div className="space-y-1.5">
              {entries.map((entry) => {
                const checked = selectedDecks.has(entry.subDeck.id);
                return (
                  <div
                    key={entry.subDeck.id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      checked
                        ? "bg-surface-lowest shadow-sm"
                        : "bg-surface-lowest/50 opacity-60"
                    }`}
                  >
                    <span className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center font-japanese-display text-lg font-bold text-primary shrink-0">
                      漢
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base text-foreground sm:text-lg">
                        {entry.subDeck.title}
                      </p>
                      <p className="text-xs text-on-surface-variant truncate sm:text-sm">
                        {entry.lessonTitle} · {entry.subDeck.cards.length} cards
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleDeck(entry.subDeck.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                        checked ? "bg-primary" : "bg-outline-variant/30"
                      }`}
                    >
                      <span
                        className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform ${
                          checked ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-16 left-0 right-0 lg:bottom-0 lg:left-72 z-30 bg-surface/95 backdrop-blur-md border-t border-outline-variant/10">
        <div className="mx-auto w-full max-w-4xl px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 sm:px-8">
          <button
            type="button"
            disabled={selectedDecks.size === 0}
            onClick={() => setSessionOpen(true)}
            className="w-full btn-primary-gradient rounded-xl py-3.5 text-white font-bold text-sm shadow-[0_8px_20px_rgba(0,36,70,0.15)] transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {selectedDecks.size === 0
              ? "Select decks to start"
              : `Start Session · ${totalSelected} cards`}
          </button>
        </div>
      </div>

      {sessionOpen && (
        <KanjiSessionModal
          entries={selectedEntries}
          onClose={() => setSessionOpen(false)}
        />
      )}
    </>
  );
}
