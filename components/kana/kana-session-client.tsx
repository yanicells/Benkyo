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
  KanaBatchSize,
  KanaSelectionKey,
  KanaScript,
  SessionCard,
} from "@/lib/types";
import { TypingPracticeInput } from "@/components/session/typing-practice-input";

type KanaSessionClientProps = {
  script: KanaScript;
  groups: KanaSelectionKey[];
  cards: Card[];
  batchSize: KanaBatchSize;
};

function processBatch(
  queue: SessionCard[],
  count: number,
  handler: (items: SessionCard[]) => SessionCard[],
): SessionCard[] {
  let next = queue;

  for (let index = 0; index < count; index += 1) {
    if (next.length === 0) {
      break;
    }
    next = handler(next);
  }

  return next;
}

export function KanaSessionClient({
  script,
  groups,
  cards,
  batchSize,
}: KanaSessionClientProps) {
  const [queue, setQueue] = useState<SessionCard[]>(() => buildQueue(cards));
  const [showAnswerKey, setShowAnswerKey] = useState(false);

  const activeCards = useMemo(
    () => queue.slice(0, batchSize),
    [queue, batchSize],
  );
  const current = activeCards[0];
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

  const expected = activeCards
    .map((card) => card.card.romaji ?? card.card.back)
    .join("");

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
        <p>
          Batch:{" "}
          <span className="font-semibold text-slate-900">{batchSize}</span>
        </p>
        <p>{queue.length} kana left</p>
      </div>

      <article className="relative rounded-3xl border border-rose-900/10 bg-white p-5 text-center shadow-sm sm:p-8">
        <button
          type="button"
          onClick={() => setShowAnswerKey(true)}
          className="absolute right-3 top-3 rounded-full border border-rose-900/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-rose-800 transition hover:border-rose-900/40 hover:bg-rose-50"
        >
          Answer key
        </button>

        <p className="text-xs uppercase tracking-[0.2em] text-rose-700">Kana</p>

        <div
          className="mt-4 grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${activeCards.length}, minmax(0, 1fr))`,
          }}
        >
          {activeCards.map((item, index) => (
            <p
              key={`${item.card.front}-${item.card.back}-${index}`}
              className="font-display text-7xl text-slate-900 sm:text-8xl"
            >
              {item.card.front}
            </p>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-2xl text-left">
          <TypingPracticeInput
            key={activeCards
              .map(
                (card, index) =>
                  `${card.card.front}-${card.card.back}-${index}`,
              )
              .join("|")}
            expected={expected}
            label={`Type romaji (${activeCards.length} at once)`}
            placeholder="romaji"
            showExpected={false}
            giveUpInline
            onComplete={() => {
              setShowAnswerKey(false);
              setQueue((previous) =>
                processBatch(previous, activeCards.length, answerCorrect),
              );
            }}
            onGiveUp={() => {
              setShowAnswerKey(false);
              setQueue((previous) =>
                processBatch(previous, activeCards.length, answerWrong),
              );
            }}
            giveUpLabel="Skip"
          />
        </div>
      </article>

      {showAnswerKey ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowAnswerKey(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-rose-900/15 bg-white p-5 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-rose-700">
              Answer key
            </p>
            <div
              className="mt-4 grid gap-3"
              style={{
                gridTemplateColumns: `repeat(${activeCards.length}, minmax(0, 1fr))`,
              }}
            >
              {activeCards.map((item, index) => (
                <div
                  key={`${item.card.front}-${item.card.back}-${index}`}
                  className="rounded-xl border border-slate-200 p-3 text-center"
                >
                  <p className="font-display text-5xl text-slate-900">
                    {item.card.front}
                  </p>
                  <p className="mt-2 text-base text-slate-700">
                    {item.card.romaji ?? item.card.back}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAnswerKey(false)}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
