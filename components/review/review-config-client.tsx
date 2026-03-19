"use client";

import { useState } from "react";
import Link from "next/link";

import type { FlipSetting, Lesson, StudyMode } from "@/lib/types";
import { getDueCards } from "@/lib/srs";

type ReviewConfigClientProps = {
  lessons: Lesson[];
};

export function ReviewConfigClient({ lessons }: ReviewConfigClientProps) {
  const [dueCount] = useState(() => {
    if (typeof window === "undefined") return 0;
    return getDueCards(lessons).length;
  });
  const [mode, setMode] = useState<StudyMode>("flashcard");
  const [flip, setFlip] = useState<FlipSetting>("jp-to-en");

  const searchParams = new URLSearchParams({ mode, flip });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-rose-900/10 bg-white p-5 text-center">
        <p className="text-4xl font-bold text-rose-800">{dueCount}</p>
        <p className="mt-1 text-sm text-slate-700">
          {dueCount === 1 ? "card" : "cards"} due for review
        </p>
      </div>

      {dueCount === 0 ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
          <p className="text-sm text-emerald-800">
            No cards are due right now. Study some decks first, then come back
            when cards are due for review.
          </p>
          <Link
            href="/decks"
            className="mt-4 inline-block rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-slate-700"
          >
            Go to decks
          </Link>
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-rose-900/10 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-rose-700">
              Study mode
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(
                [
                  {
                    value: "flashcard" as StudyMode,
                    label: "Flashcard",
                    desc: "Reveal and self-rate",
                  },
                  {
                    value: "multiple-choice" as StudyMode,
                    label: "Multiple Choice",
                    desc: "Pick from options",
                  },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer flex-col gap-1 rounded-2xl border p-4 transition ${
                    mode === opt.value
                      ? "border-rose-600 bg-rose-50"
                      : "border-rose-900/15 bg-white hover:border-rose-700/40"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="mode"
                      checked={mode === opt.value}
                      onChange={() => setMode(opt.value)}
                      className="accent-rose-700"
                    />
                    <span className="font-semibold text-slate-900">
                      {opt.label}
                    </span>
                  </span>
                  <span className="text-sm text-slate-700">{opt.desc}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-rose-900/10 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-rose-700">
              Direction
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(
                [
                  {
                    value: "jp-to-en" as FlipSetting,
                    label: "Japanese → English",
                  },
                  {
                    value: "en-to-jp" as FlipSetting,
                    label: "English → Japanese",
                  },
                ] as const
              ).map((opt) => (
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
                    checked={flip === opt.value}
                    onChange={() => setFlip(opt.value)}
                    className="accent-rose-700"
                  />
                  <span className="font-semibold text-slate-900">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <div className="flex justify-end">
            <Link
              href={`/review/session?${searchParams.toString()}`}
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-slate-700"
            >
              Start review
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
