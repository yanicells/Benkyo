"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  answerCorrect,
  answerWrong,
  buildQueue,
  isSessionComplete,
} from "@/lib/session";
import type {
  Card,
  KanaSelectionKey,
  KanaScript,
  SessionCard,
} from "@/lib/types";
import { TypingPracticeInput } from "@/components/session/typing-practice-input";

type KanaSessionClientProps = {
  script: KanaScript;
  groups: KanaSelectionKey[];
  cards: Card[];
};

export function KanaSessionClient({
  script,
  groups,
  cards,
}: KanaSessionClientProps) {
  const [queue, setQueue] = useState<SessionCard[]>(() => buildQueue(cards));
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  const current = queue[0];
  const complete = isSessionComplete(queue);

  const groupLabel = useMemo(() => {
    if (groups.length <= 2) {
      return groups.join(" / ");
    }
    return `${groups.length} row selections`;
  }, [groups]);

  if (complete || !current) {
    return (
      <section className="space-y-4 rounded-3xl border border-emerald-600/20 bg-emerald-50 p-6 text-center sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-800">
          Complete
        </p>
        <h2 className="font-display text-4xl text-emerald-900">Great work</h2>
        <p className="text-emerald-800">You cleared every kana in this set.</p>
        <Link
          href="/kana"
          className="mx-auto inline-flex rounded-full bg-emerald-700 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-emerald-600 sm:text-sm"
        >
          Back to kana config
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-rose-900/10 bg-white px-3 py-2 text-sm text-slate-700 sm:px-4 sm:py-3">
        <p>
          Script: <span className="font-semibold text-slate-900">{script}</span>
        </p>
        <p>
          Scope:{" "}
          <span className="font-semibold text-slate-900">{groupLabel}</span>
        </p>
        <p>{queue.length} kana left</p>
      </div>

      <article className="relative rounded-3xl border border-rose-900/10 bg-white p-5 text-center shadow-sm sm:p-8">
        <button
          type="button"
          onClick={() => setShowCheatSheet(true)}
          className="absolute right-3 top-3 rounded-full border border-rose-900/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-rose-800 transition hover:border-rose-900/40 hover:bg-rose-50"
        >
          Cheat sheet
        </button>

        <p className="text-xs uppercase tracking-[0.2em] text-rose-700">Kana</p>
        <p className="mt-4 font-display text-8xl text-slate-900 sm:text-9xl">
          {current.card.front}
        </p>

        <div className="mx-auto mt-8 max-w-xl text-left">
          <TypingPracticeInput
            key={`${current.card.front}-${current.card.back}`}
            expected={current.card.back}
            label="Type romaji"
            placeholder="romaji"
            showExpected={false}
            onComplete={() => setQueue((previous) => answerCorrect(previous))}
            onGiveUp={() => setQueue((previous) => answerWrong(previous))}
            giveUpLabel="Skip"
          />
        </div>
      </article>

      {showCheatSheet ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-rose-900/15 bg-white p-5 shadow-lg">
            <p className="text-xs uppercase tracking-[0.2em] text-rose-700">
              Cheat sheet
            </p>
            <h3 className="mt-3 font-display text-4xl text-slate-900">
              {current.card.front}
            </h3>
            <p className="mt-2 text-lg text-slate-700">{current.card.back}</p>
            <button
              type="button"
              onClick={() => setShowCheatSheet(false)}
              className="mt-5 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
