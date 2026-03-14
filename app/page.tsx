import Link from "next/link";

import { PageShell } from "@/components/shared/page-shell";

export default function Home() {
  return (
    <PageShell
      eyebrow="Study hub"
      title="Benkyō"
      subtitle="Personal Genki-first drills for vocabulary and kana mastery. No accounts, no database, just focused reps."
      backHref="/"
    >
      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/decks"
          className="group rounded-3xl border border-rose-900/10 bg-white/90 p-6  transition hover:-translate-y-0.5 hover:border-rose-700/30"
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
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-rose-800 transition group-hover:text-rose-900">
            Open decks
          </p>
        </Link>

        <Link
          href="/kana"
          className="group rounded-3xl border border-rose-900/10 bg-white/90 p-6  transition hover:-translate-y-0.5 hover:border-rose-700/30"
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
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-rose-800 transition group-hover:text-rose-900">
            Open kana
          </p>
        </Link>
      </section>

      <section className="space-y-3">
        <p className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-700"></p>
        <div className="grid gap-3 sm:grid-cols-3">
          <article className="rounded-2xl border border-rose-900/10 bg-white/90 p-4 hover:-translate-y-0.5 hover:border-rose-700/30">
            <p className="text-xs uppercase tracking-[0.16em] text-rose-700">
              General Keybinds
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              <span className="rounded border border-rose-900/20 bg-rose-50 px-1.5 py-0.5 text-xs font-semibold text-rose-800">
                Enter
              </span>{" "}
              confirm and continue in the current flow.
            </p>
          </article>

          <article className="rounded-2xl border border-rose-900/10 bg-white/90 p-4 hover:-translate-y-0.5 hover:border-rose-700/30">
            <p className="text-xs uppercase tracking-[0.16em] text-rose-700">
              Choice Inputs Keybinds
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              <span className="rounded border border-rose-900/20 bg-rose-50 px-1.5 py-0.5 text-xs font-semibold text-rose-800">
                1-4
              </span>{" "}
              pick multiple-choice options directly.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Flashcards:{" "}
              <span className="rounded border border-rose-900/20 bg-rose-50 px-1.5 py-0.5 text-xs font-semibold text-rose-800">
                1
              </span>{" "}
              = Missed it,{" "}
              <span className="rounded border border-rose-900/20 bg-rose-50 px-1.5 py-0.5 text-xs font-semibold text-rose-800">
                2
              </span>{" "}
              or{" "}
              <span className="rounded border border-rose-900/20 bg-rose-50 px-1.5 py-0.5 text-xs font-semibold text-rose-800">
                Enter
              </span>{" "}
              = Got it after reveal.
            </p>
          </article>

          <article className="rounded-2xl border border-rose-900/10 bg-white/90 p-4 hover:-translate-y-0.5 hover:border-rose-700/30">
            <p className="text-xs uppercase tracking-[0.16em] text-rose-700">
              Answer Key Keybinds
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              <span className="rounded border border-rose-900/20 bg-rose-50 px-1.5 py-0.5 text-xs font-semibold text-rose-800">
                Tab
              </span>{" "}
              toggle answer key modal in typing and kana sessions.
            </p>
          </article>
        </div>
      </section>
    </PageShell>
  );
}
