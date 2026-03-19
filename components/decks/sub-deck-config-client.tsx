"use client";

import { useState } from "react";
import Link from "next/link";

import type { CardType, FlipSetting, StudyMode } from "@/lib/types";

type SubDeckConfigClientProps = {
  lessonId: string;
  subDeckId: string;
  cardTypes: CardType[];
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

export function SubDeckConfigClient({
  lessonId,
  subDeckId,
  cardTypes,
}: SubDeckConfigClientProps) {
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

  const searchParams = new URLSearchParams({
    mode,
    flip,
    types: [...selectedTypes].join(","),
  });

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-rose-900/10 bg-white p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-rose-700">
          Study mode
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {modeOptions.map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 transition ${
                mode === opt.value
                  ? "border-rose-600 bg-rose-50"
                  : "border-rose-900/15 bg-white hover:border-rose-700/40"
              }`}
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="mode"
                  value={opt.value}
                  checked={mode === opt.value}
                  onChange={() => setMode(opt.value)}
                  className="accent-rose-700"
                />
                <span className="font-semibold text-slate-900">
                  {opt.label}
                </span>
              </span>
              <span className="text-sm text-slate-700">{opt.description}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-rose-900/10 bg-white p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-rose-700">
          Direction
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {flipOptions.map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-center gap-2 rounded-2xl border p-4 transition ${
                flip === opt.value
                  ? "border-rose-600 bg-rose-50"
                  : "border-rose-900/15 bg-white hover:border-rose-700/40"
              }`}
            >
              <input
                type="radio"
                name="flip"
                value={opt.value}
                checked={flip === opt.value}
                onChange={() => setFlip(opt.value)}
                className="accent-rose-700"
              />
              <span className="font-semibold text-slate-900">{opt.label}</span>
            </label>
          ))}
        </div>
      </section>

      {cardTypes.length > 1 && (
        <section className="rounded-2xl border border-rose-900/10 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-rose-700">
            Card types
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {cardTypes.map((type) => (
              <label
                key={type}
                className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                  selectedTypes.has(type)
                    ? "border-rose-600 bg-rose-50 text-rose-900"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-400"
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
          href={`/decks/${lessonId}`}
          className="rounded-full border border-rose-900/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-rose-800 transition hover:border-rose-900/40 hover:bg-rose-100"
        >
          Back
        </Link>
        <Link
          href={`/decks/${lessonId}/${subDeckId}/session?${searchParams.toString()}`}
          className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-slate-700"
        >
          Start session
        </Link>
      </div>
    </div>
  );
}
