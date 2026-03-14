"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { answerCorrect, answerWrong, buildQueue, isSessionComplete } from "@/lib/session";
import type { Card, KanaGroup, KanaScript, SessionCard } from "@/lib/types";
import { TypingPracticeInput } from "@/components/session/typing-practice-input";

type KanaSessionClientProps = {
  script: KanaScript;
  groups: KanaGroup[];
  cards: Card[];
};

export function KanaSessionClient({ script, groups, cards }: KanaSessionClientProps) {
  const [queue, setQueue] = useState<SessionCard[]>(() => buildQueue(cards));

  const current = queue[0];
  const complete = isSessionComplete(queue);

  const groupLabel = useMemo(() => groups.join(" / "), [groups]);

  if (complete || !current) {
    return (
      <section className="space-y-6 rounded-3xl border border-emerald-600/20 bg-emerald-50 p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-800">Complete</p>
        <h2 className="font-display text-4xl text-emerald-900">Great work</h2>
        <p className="text-emerald-800">You cleared every kana in this set.</p>
        <Link
          href="/kana"
          className="mx-auto inline-flex rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-emerald-600"
        >
          Back to kana config
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-rose-900/10 bg-white/70 px-4 py-3 text-sm text-slate-700">
        <p>
          Script: <span className="font-semibold text-slate-900">{script}</span>
        </p>
        <p>
          Groups: <span className="font-semibold text-slate-900">{groupLabel}</span>
        </p>
        <p>{queue.length} kana left</p>
      </div>

      <article className="rounded-3xl border border-rose-900/10 bg-gradient-to-br from-white to-rose-50 p-8 text-center shadow-lg">
        <p className="text-xs uppercase tracking-[0.2em] text-rose-700">Kana</p>
        <p className="mt-4 font-display text-8xl text-slate-900 sm:text-9xl">{current.card.front}</p>

        <div className="mx-auto mt-8 max-w-xl text-left">
          <TypingPracticeInput
            key={`${current.card.front}-${current.card.back}`}
            expected={current.card.back}
            label="Type romaji"
            placeholder="romaji"
            onComplete={() => setQueue((previous) => answerCorrect(previous))}
            onGiveUp={() => setQueue((previous) => answerWrong(previous))}
            giveUpLabel="Skip"
          />
        </div>
      </article>
    </section>
  );
}
