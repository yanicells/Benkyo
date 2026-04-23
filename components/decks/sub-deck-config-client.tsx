"use client";

import { useState } from "react";
import Link from "next/link";

import type { CardType, StudyMode } from "@/lib/types";

type SubDeckConfigClientProps = {
  lessonId: string;
  subDeckId: string;
  cardTypes: CardType[];
  basePath?: "/decks" | "/reviewer";
};

const modeOptions: { value: StudyMode; label: string; description: string }[] =
  [
    {
      value: "flashcard",
      label: "Flashcard",
      description: "Reveal answer manually and self-grade.",
    },
    {
      value: "multiple-choice",
      label: "Multiple Choice",
      description: "Pick from randomized options quickly.",
    },
  ];

const typeLabels: Record<CardType, string> = {
  vocab: "Vocabulary",
  grammar: "Grammar",
  "fill-in": "Fill-in-the-blank",
  conjugation: "Conjugation",
  translate: "Translation",
  culture: "Culture",
};

export function SubDeckConfigClient({
  lessonId,
  subDeckId,
  cardTypes,
  basePath = "/decks",
}: SubDeckConfigClientProps) {
  const [mode, setMode] = useState<StudyMode>("flashcard");
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

  const searchParams = new URLSearchParams({
    mode,
    types: [...selectedTypes].join(","),
  });

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-surface-lowest p-5 shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
        <p className="text-xs uppercase tracking-[0.22em] text-primary">
          Study mode
        </p>
        <div className="mt-4 grid gap-3 [@media(min-width:520px)]:grid-cols-2">
          {modeOptions.map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer flex-col gap-2 rounded-lg border p-4 transition ${
                mode === opt.value
                  ? "border-primary/20 bg-surface-low"
                  : "border-outline-variant/20 bg-white hover:border-primary/30"
              }`}
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="mode"
                  value={opt.value}
                  checked={mode === opt.value}
                  onChange={() => setMode(opt.value)}
                  className="accent-primary"
                />
                <span className="font-semibold text-foreground">
                  {opt.label}
                </span>
              </span>
              <span className="text-sm text-on-surface-variant">{opt.description}</span>
            </label>
          ))}
        </div>
      </section>

      {cardTypes.length > 1 && (
        <section className="rounded-lg bg-surface-lowest p-5 shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
          <p className="text-xs uppercase tracking-[0.22em] text-primary">
            Card types
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {cardTypes.map((type) => (
              <label
                key={type}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition ${
                  selectedTypes.has(type)
                    ? "border-primary/20 bg-surface-low text-primary"
                    : "border-outline-variant/20 bg-white text-on-surface-variant hover:border-primary/30"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedTypes.has(type)}
                  onChange={() => toggleType(type)}
                  className="sr-only"
                />
                {typeLabels[type]}
              </label>
            ))}
          </div>
        </section>
      )}

      <div className="flex items-center justify-between gap-3">
        <Link
          href={`${basePath}/${lessonId}`}
          className="rounded-lg bg-surface-low px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-primary transition hover:bg-secondary-container"
        >
          Back
        </Link>
        <Link
          href={`${basePath}/${lessonId}/${subDeckId}/session?${searchParams.toString()}`}
          className="btn-primary-gradient rounded-lg px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:opacity-90"
        >
          Start session
        </Link>
      </div>
    </div>
  );
}
