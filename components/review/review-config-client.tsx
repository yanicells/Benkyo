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
      <div className="rounded-lg bg-surface-lowest p-5 text-center shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
        <p className="text-3xl font-bold text-primary sm:text-4xl">{dueCount}</p>
        <p className="mt-1 text-sm text-on-surface-variant">
          {dueCount === 1 ? "card" : "cards"} due for review
        </p>
      </div>

      {dueCount === 0 ? (
        <div className="rounded-lg bg-[rgba(0,65,58,0.06)] p-5 text-center">
          <p className="text-sm text-[var(--success)]">
            No cards are due right now. Study some decks first, then come back
            when cards are due for review.
          </p>
          <Link
            href="/decks"
            className="btn-primary-gradient mt-4 inline-block rounded-lg px-5 py-2 text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:opacity-90"
          >
            Go to decks
          </Link>
        </div>
      ) : (
        <>
          <section className="rounded-lg bg-surface-lowest p-5 shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
            <p className="text-xs uppercase tracking-[0.22em] text-primary">
              Study mode
            </p>
            <div className="mt-4 grid gap-3 [@media(min-width:520px)]:grid-cols-2">
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
                  className={`flex cursor-pointer flex-col gap-1 rounded-lg border p-4 transition ${
                    mode === opt.value
                      ? "border-primary/20 bg-surface-low"
                      : "border-outline-variant/20 bg-white hover:border-primary/30"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="mode"
                      checked={mode === opt.value}
                      onChange={() => setMode(opt.value)}
                      className="accent-primary"
                    />
                    <span className="font-semibold text-foreground">
                      {opt.label}
                    </span>
                  </span>
                  <span className="text-sm text-on-surface-variant">{opt.desc}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-lg bg-surface-lowest p-5 shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
            <p className="text-xs uppercase tracking-[0.22em] text-primary">
              Direction
            </p>
            <div className="mt-4 grid gap-3 [@media(min-width:520px)]:grid-cols-2">
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
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border p-4 transition ${
                    flip === opt.value
                      ? "border-primary/20 bg-surface-low"
                      : "border-outline-variant/20 bg-white hover:border-primary/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="flip"
                    checked={flip === opt.value}
                    onChange={() => setFlip(opt.value)}
                    className="accent-primary"
                  />
                  <span className="font-semibold text-foreground">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <div className="flex justify-end">
            <Link
              href={`/review/session?${searchParams.toString()}`}
              className="btn-primary-gradient rounded-lg px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:opacity-90"
            >
              Start review
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
