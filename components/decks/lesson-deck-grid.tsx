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
          className="group relative overflow-hidden rounded-3xl border border-rose-900/15 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-rose-700/30 hover:shadow-md"
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
          <span className="mt-8 inline-block rounded-full border border-rose-900/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-rose-800 transition group-hover:border-rose-900/40">
            Open lesson
          </span>
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-rose-100/80 blur-2xl" />
        </Link>
      ))}
    </section>
  );
}
