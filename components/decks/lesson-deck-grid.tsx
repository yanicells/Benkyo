"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import type { Lesson } from "@/lib/types";
import { getLessonMastery } from "@/lib/srs";

type LessonDeckGridProps = {
  lessons: Lesson[];
};

const subscribe = () => () => {};
const serverSnapshot = () => "server";
const clientSnapshot = () => "client";

function LessonCard({ lesson }: { lesson: Lesson }) {
  const env = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const mastery = env === "client" ? getLessonMastery(lesson) : 0;

  const totalCards = lesson.subDecks.reduce(
    (sum, sd) => sum + sd.cards.length,
    0,
  );

  return (
    <Link
      href={`/decks/${lesson.id}`}
      className="group overflow-hidden rounded-3xl border border-rose-900/10 bg-white/90 p-5 shadow-[0_8px_20px_rgba(74,24,32,0.08)] transition duration-200 hover:-translate-y-0.5 hover:border-rose-700/30"
    >
      <p className="text-xs uppercase tracking-[0.25em] text-rose-700">
        Lesson
      </p>
      <h2 className="mt-3 font-display text-3xl text-slate-900">
        {lesson.title}
      </h2>
      <p className="mt-3 text-sm text-slate-700">
        {lesson.subDecks.length} sub-decks &middot; {totalCards} cards
      </p>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>{mastery}% mastered</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-rose-100">
          <div
            className="h-full rounded-full bg-rose-600 transition-all duration-500"
            style={{ width: `${mastery}%` }}
          />
        </div>
      </div>

      <span className="mt-5 inline-block rounded-full border border-rose-900/20 bg-rose-50/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-rose-800 transition group-hover:border-rose-900/40">
        Open lesson
      </span>
    </Link>
  );
}

export function LessonDeckGrid({ lessons }: LessonDeckGridProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {lessons.map((lesson) => (
        <LessonCard key={lesson.id} lesson={lesson} />
      ))}
    </section>
  );
}
