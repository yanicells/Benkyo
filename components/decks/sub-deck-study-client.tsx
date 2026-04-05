"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { Card, CardType, FlipSetting, LessonMeta, StudyMode } from "@/lib/types";

type SubDeckStudyClientProps = {
  lessonId: string;
  subDeckId: string;
  title: string;
  lessonTitle: string;
  cardCount: number;
  cardTypes: CardType[];
  meta: LessonMeta | null;
  cards: Card[];
};

const modeOptions: { value: StudyMode; label: string; icon: string; description: string }[] = [
  {
    value: "flashcard",
    label: "Flashcard",
    icon: "📇",
    description: "Reveal answer manually and self-grade.",
  },
  {
    value: "multiple-choice",
    label: "Multiple Choice",
    icon: "✦",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface-lowest rounded-2xl shadow-[0_24px_64px_rgba(0,14,33,0.2)] overflow-hidden">
        {/* Dialog header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
          <h3 className="font-display text-lg font-bold text-foreground">Session Settings</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-low transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Study mode */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-3">
              Study mode
            </p>
            <div className="grid gap-2 grid-cols-2">
              {modeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMode(opt.value)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl p-4 transition-all text-center ${
                    mode === opt.value
                      ? "bg-primary/10 ring-2 ring-primary/20"
                      : "bg-surface-low hover:bg-surface-low/80"
                  }`}
                >
                  <span className="text-lg">{opt.icon}</span>
                  <span className="text-sm font-semibold text-foreground">{opt.label}</span>
                  <span className="text-[10px] text-on-surface-variant leading-tight">{opt.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Direction */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-3">
              Direction
            </p>
            <div className="grid gap-2 grid-cols-2">
              {flipOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFlip(opt.value)}
                  className={`flex items-center justify-center gap-2 rounded-xl p-3 text-sm font-semibold transition-all ${
                    flip === opt.value
                      ? "bg-primary/10 ring-2 ring-primary/20 text-primary"
                      : "bg-surface-low text-foreground hover:bg-surface-low/80"
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
                Card types
              </p>
              <div className="flex flex-wrap gap-2">
                {cardTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleType(type)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                      selectedTypes.has(type)
                        ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                        : "bg-surface-low text-on-surface-variant hover:bg-surface-low/80"
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
  cardCount,
  cardTypes,
  meta,
  cards,
}: SubDeckStudyClientProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<StudyMode>("flashcard");
  const [flip, setFlip] = useState<FlipSetting>("jp-to-en");
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
    router.push(`/decks/${lessonId}/${subDeckId}/session?${searchParams.toString()}`);
  };

  // Get a short summary from meta
  const quickNote = meta?.notes
    ? meta.notes.length > 200
      ? meta.notes.slice(0, 200) + "…"
      : meta.notes
    : null;

  const keyPoints = meta?.cheatSheet?.slice(0, 3) ?? [];

  return (
    <section className="relative mx-auto w-full max-w-4xl px-4 py-6 pb-32 sm:px-8 sm:py-10 sm:pb-36">
      {/* Back button */}
      <div className="sticky top-14 lg:top-16 z-20 -mx-4 sm:-mx-8 mb-6 border-b border-outline-variant/10 bg-surface/95 px-4 py-3 backdrop-blur-md sm:px-8">
        <Link
          href={`/decks/${lessonId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {lessonTitle}
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

      {/* Quick Study Notes */}
      {(quickNote || keyPoints.length > 0) && (
        <div className="mb-8 rounded-2xl bg-surface-lowest shadow-[0_8px_32px_rgba(0,36,70,0.06)] overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-outline-variant/10 bg-primary/3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">
              Quick Review
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
                  <li key={i} className="flex items-start gap-2.5 text-sm text-foreground leading-relaxed">
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

      {/* Card preview */}
      <div className="rounded-2xl bg-surface-lowest p-5 shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-[0.22em] text-primary font-bold">
            Card preview
          </p>
          <p className="text-xs text-on-surface-variant">{cardCount} entries</p>
        </div>
        <div className="space-y-2">
          {cards.map((card, i) => (
            <div
              key={`${card.front}-${card.back}-${i}`}
              className="flex items-start gap-2 rounded-lg bg-surface-low px-3 py-2"
            >
              <span className="mt-0.5 shrink-0 rounded-lg bg-surface-lowest px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                {card.type}
              </span>
              <div className="min-w-0">
                <p className="font-japanese text-xl text-foreground">
                  {card.front}
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">{card.back}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky bottom bar — Start Session CTA */}
      <div className="fixed bottom-16 left-0 right-0 lg:bottom-0 lg:left-72 z-30 bg-surface/95 backdrop-blur-md border-t border-outline-variant/10">
        <div className="mx-auto w-full max-w-4xl px-4 py-3 sm:px-8">
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
