import Link from "next/link";

import { PageShell } from "@/components/shared/page-shell";

export default function Home() {
  return (
    <PageShell
      eyebrow="Study hub"
      title="Japanese study studio"
      subtitle="Personal Genki-first drills for vocabulary and kana mastery. No accounts, no database, just focused reps."
      backHref="/"
    >
      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/decks"
          className="fade-in-up rounded-3xl border border-rose-900/15 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-rose-700/30"
          style={{ animationDelay: "80ms" }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-rose-700">
            Entry point
          </p>
          <h2 className="mt-3 font-display text-3xl text-slate-900">
            Lesson decks
          </h2>
          <p className="mt-2 text-sm text-slate-700">
            Practice Genki vocab and kanji cards in flashcard, multiple-choice,
            or typing mode.
          </p>
        </Link>

        <Link
          href="/kana"
          className="fade-in-up rounded-3xl border border-rose-900/15 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-rose-700/30"
          style={{ animationDelay: "170ms" }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-rose-700">
            Entry point
          </p>
          <h2 className="mt-3 font-display text-3xl text-slate-900">
            Kana practice
          </h2>
          <p className="mt-2 text-sm text-slate-700">
            Select hiragana or katakana groups and train romaji with strict
            character feedback.
          </p>
        </Link>
      </section>
    </PageShell>
  );
}
