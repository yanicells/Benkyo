import Link from "next/link";

import type { Lesson } from "@/lib/types";

type LessonDeckGridProps = {
  lessons: Lesson[];
};

export function LessonDeckGrid({ lessons }: LessonDeckGridProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {lessons.map((lesson) => (
        <Link
          key={lesson.id}
          href={`/decks/${lesson.id}`}
          className="group overflow-hidden rounded-3xl border border-rose-900/10 bg-white/90 p-5 shadow-[0_8px_20px_rgba(74,24,32,0.08)] transition duration-200 hover:-translate-y-0.5 hover:border-rose-700/30"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-rose-700">
            Deck
          </p>
          <h2 className="mt-3 font-display text-3xl text-slate-900">
            {lesson.title}
          </h2>
          <p className="mt-3 text-sm text-slate-700">
            {lesson.cards.length} cards ready for review
          </p>
          <span className="mt-8 inline-block rounded-full border border-rose-900/20 bg-rose-50/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-rose-800 transition group-hover:border-rose-900/40">
            Open lesson
          </span>
        </Link>
      ))}
    </section>
  );
}
