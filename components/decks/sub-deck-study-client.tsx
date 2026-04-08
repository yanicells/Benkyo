"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getAllSRS,
  makeCardId,
  subscribeToStudyData,
  getStudyDataRevision,
} from "@/lib/srs";

import type {
  Card,
  CardType,
  FlipSetting,
  LessonMeta,
  StudyMode,
} from "@/lib/types";

type SubDeckStudyClientProps = {
  lessonId: string;
  subDeckId: string;
  title: string;
  lessonTitle: string;
  backHref?: string;
  backLabel?: string;
  cardCount: number;
  cardTypes: CardType[];
  meta: LessonMeta | null;
  cards: Card[];
  progressCardRefs: { subDeckId: string; cardIndex: number }[];
};

const modeOptions: {
  value: StudyMode;
  label: string;
  description: string;
}[] = [
  {
    value: "flashcard",
    label: "Flashcard",
    description: "Reveal answer manually and self-grade.",
  },
  {
    value: "multiple-choice",
    label: "Multiple Choice",
    description: "Pick from randomized options.",
  },
];

const flipOptions: { value: FlipSetting; label: string }[] = [
  { value: "jp-to-en", label: "Japanese → English" },
  { value: "en-to-jp", label: "English → Japanese" },
];

const typeLabels: Record<CardType, string> = {
  vocab: "Vocabulary",
  grammar: "Grammar",
  "fill-in": "Fill-in-the-blank",
  conjugation: "Conjugation",
  translate: "Translation",
  culture: "Culture",
};

const previewTypeLabels: Record<CardType, string> = {
  vocab: "Vocab",
  grammar: "Grammar",
  "fill-in": "Fill In",
  conjugation: "Conjug.",
  translate: "Translate",
  culture: "Culture",
};

function StudyModeIcon({ mode }: { mode: StudyMode }) {
  if (mode === "flashcard") {
    return (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <rect x="3" y="6" width="14" height="11" rx="2" />
        <path d="M7 10h6M7 13h4" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M17 9h3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M8 9h8M8 13h5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 13l2 2 3-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsDialog({
  open,
  onClose,
  mode,
  setMode,
  flip,
  setFlip,
  cardTypes,
  selectedTypes,
  toggleType,
  onStart,
}: {
  open: boolean;
  onClose: () => void;
  mode: StudyMode;
  setMode: (m: StudyMode) => void;
  flip: FlipSetting;
  setFlip: (f: FlipSetting) => void;
  cardTypes: CardType[];
  selectedTypes: Set<CardType>;
  toggleType: (t: CardType) => void;
  onStart: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex max-h-[75vh] sm:max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-surface-lowest shadow-[0_24px_64px_rgba(0,14,33,0.2)]">
        {/* Dialog header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
          <h3 className="font-display text-lg font-bold text-foreground">
            Session Settings
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
          {/* Study mode */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-3">
              Study mode{" "}
              <span className="text-on-surface-variant">(Select 1)</span>
            </p>
            <div className="grid gap-2 grid-cols-2">
              {modeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMode(opt.value)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 transition-all text-center ${
                    mode === opt.value
                      ? "border-primary bg-primary/10"
                      : "border-primary/20 bg-surface-lowest hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  <span
                    className={
                      mode === opt.value
                        ? "text-primary"
                        : "text-on-surface-variant"
                    }
                  >
                    <StudyModeIcon mode={opt.value} />
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-on-surface-variant leading-tight">
                    {opt.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Direction */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-3">
              Direction{" "}
              <span className="text-on-surface-variant">(Select 1)</span>
            </p>
            <div className="grid gap-2 grid-cols-2">
              {flipOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFlip(opt.value)}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-semibold transition-all ${
                    flip === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-primary/20 bg-surface-lowest text-foreground hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Card types filter */}
          {cardTypes.length > 1 && (
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-3">
                Card types{" "}
                <span className="text-on-surface-variant">(Add or remove)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {cardTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleType(type)}
                    className={`rounded-lg border-2 px-3 py-1.5 text-sm font-medium transition-all ${
                      selectedTypes.has(type)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-primary/20 bg-surface-lowest text-on-surface-variant hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  >
                    {typeLabels[type]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Start button */}
        <div className="px-6 py-4 border-t border-outline-variant/10">
          <button
            type="button"
            onClick={onStart}
            className="w-full btn-primary-gradient rounded-xl py-4 text-white font-bold text-base shadow-[0_8px_24px_rgba(0,36,70,0.15)] transition hover:opacity-90 hover:shadow-lg"
          >
            Start Session
          </button>
        </div>
      </div>
    </div>
  );
}

export function SubDeckStudyClient({
  lessonId,
  subDeckId,
  title,
  lessonTitle,
  backHref,
  backLabel,
  cardCount,
  cardTypes,
  meta,
  cards,
  progressCardRefs,
}: SubDeckStudyClientProps) {
  const router = useRouter();
  const dataRevision = useSyncExternalStore(
    subscribeToStudyData,
    getStudyDataRevision,
    () => -1,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<StudyMode>("flashcard");
  const [flip, setFlip] = useState<FlipSetting>("jp-to-en");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<Set<CardType>>(
    () => new Set(cardTypes),
  );

  const toggleType = (type: CardType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const handleStart = () => {
    const searchParams = new URLSearchParams({
      mode,
      flip,
      types: [...selectedTypes].join(","),
    });
    router.push(
      `/decks/${lessonId}/${subDeckId}/session?${searchParams.toString()}`,
    );
  };

  // Get a short summary from meta
  const quickNote = meta?.notes
    ? meta.notes.length > 200
      ? meta.notes.slice(0, 200) + "…"
      : meta.notes
    : null;

  const keyPoints = meta?.cheatSheet?.slice(0, 3) ?? [];

  const progress = useMemo(() => {
    if (dataRevision < 0) {
      return {
        total: progressCardRefs.length,
        reviewed: 0,
        mastered: 0,
        reviewedPct: 0,
        masteryPct: 0,
      };
    }

    const all = getAllSRS();
    let reviewed = 0;
    let mastered = 0;

    for (const ref of progressCardRefs) {
      const srs = all[makeCardId(ref.subDeckId, ref.cardIndex)];
      if (!srs) continue;
      if (srs.totalReviews > 0) reviewed++;
      if (srs.interval >= 21) mastered++;
    }

    const total = progressCardRefs.length;
    const reviewedPct = total === 0 ? 0 : Math.round((reviewed / total) * 100);
    const masteryPct = total === 0 ? 0 : Math.round((mastered / total) * 100);

    return { total, reviewed, mastered, reviewedPct, masteryPct };
  }, [dataRevision, progressCardRefs]);

  const filteredPreviewCards = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return cards;
    return cards.filter(
      (card) =>
        card.front.toLowerCase().includes(q) ||
        card.back.toLowerCase().includes(q) ||
        (card.romaji && card.romaji.toLowerCase().includes(q)),
    );
  }, [cards, searchQuery]);

  return (
    <section className="relative mx-auto w-full max-w-4xl px-4 pt-0 pb-32 sm:px-8 sm:pt-0 sm:pb-36">
      {/* Back button */}
      <div className="sticky top-14 lg:top-16 z-20 -mx-4 sm:-mx-8 mb-6 border-b border-outline-variant/10 bg-surface/95 px-4 py-3 backdrop-blur-md sm:px-8">
        <Link
          href={backHref ?? `/decks/${lessonId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {backLabel ?? lessonTitle}
        </Link>
      </div>

      {/* Header */}
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-on-surface-variant mb-2">
          {subDeckId === "all" ? "All Sub-decks" : "Sub-deck"}
        </p>
        <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-primary sm:text-5xl">
          {title}
        </h1>
        <p className="mt-2 text-base text-on-surface-variant">
          {cardCount} cards available
        </p>
      </header>

      {/* Read this block */}
      {(quickNote || keyPoints.length > 0) && (
        <div className="mb-8 rounded-2xl border border-primary/10 bg-surface-lowest shadow-[0_8px_32px_rgba(0,36,70,0.06)] overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-outline-variant/10 bg-primary/3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <svg
                className="w-4 h-4 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">
              Read this first
            </p>
          </div>
          <div className="px-6 py-5 space-y-4">
            {quickNote && (
              <p className="text-sm leading-relaxed text-on-surface-variant">
                {quickNote}
              </p>
            )}
            {keyPoints.length > 0 && (
              <ul className="space-y-2">
                {keyPoints.map((point, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-foreground leading-relaxed"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                      {i + 1}
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Lesson/deck progress */}
      <div className="mb-8 rounded-2xl bg-surface-lowest p-5 shadow-[0_8px_28px_rgba(0,36,70,0.06)]">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
            {subDeckId === "all" ? "Lesson Progress" : "Deck Progress"}
          </p>
          <p className="text-[10px] text-on-surface-variant">
            {progress.total} cards
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-primary">Mastery</span>
              <span className="text-on-surface-variant">
                {progress.mastered}/{progress.total} ({progress.masteryPct}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary-container overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progress.masteryPct}%` }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-amber-700">Reviewed</span>
              <span className="text-on-surface-variant">
                {progress.reviewed}/{progress.total} ({progress.reviewedPct}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary-container overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-400 transition-all duration-500"
                style={{ width: `${progress.reviewedPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="sticky top-26 lg:top-27.5 z-20 -mx-4 mb-6 border-b border-outline-variant/10 bg-surface/95 px-4 py-2 backdrop-blur-md sm:-mx-8 sm:px-8">
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
            placeholder="Search cards..."
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

      {/* Card preview */}
      <div className="rounded-2xl bg-surface-lowest p-5 shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-[0.22em] text-primary font-bold">
            Card preview
          </p>
          <p className="text-xs text-on-surface-variant">
            {filteredPreviewCards.length} entries
          </p>
        </div>
        {filteredPreviewCards.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-4 text-center">
            No cards match your search.
          </p>
        ) : (
          <div className="space-y-2">
            {filteredPreviewCards.map((card, i) => (
              <div
                key={`${card.front}-${card.back}-${i}`}
                className="flex items-center gap-2 rounded-lg bg-surface-low px-3 py-2"
              >
                <span className="inline-flex h-6 w-24 shrink-0 items-center justify-center rounded-lg bg-surface-lowest px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                  {previewTypeLabels[card.type]}
                </span>
                <div className="min-w-0">
                  <p className="font-japanese text-xl font-medium text-foreground">
                    {card.front}
                  </p>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {card.back}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky bottom bar — Start Session CTA */}
      <div className="fixed bottom-16 left-0 right-0 lg:bottom-0 lg:left-72 z-30 bg-surface/95 backdrop-blur-md border-t border-outline-variant/10">
        <div className="mx-auto w-full max-w-4xl px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 sm:px-8">
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="w-full btn-primary-gradient rounded-xl py-3.5 text-white font-bold text-sm shadow-[0_8px_20px_rgba(0,36,70,0.15)] transition hover:opacity-90"
          >
            Start Session
          </button>
        </div>
      </div>

      {/* Settings Dialog */}
      <SettingsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        mode={mode}
        setMode={setMode}
        flip={flip}
        setFlip={setFlip}
        cardTypes={cardTypes}
        selectedTypes={selectedTypes}
        toggleType={toggleType}
        onStart={handleStart}
      />
    </section>
  );
}
