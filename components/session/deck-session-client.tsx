"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { answerCorrect, answerWrong, buildQueue } from "@/lib/session";
import type { Card, FlipSetting, SessionCard, StudyMode } from "@/lib/types";
import { TypingPracticeInput } from "@/components/session/typing-practice-input";

type DeckSessionClientProps = {
  lessonId: string;
  lessonTitle: string;
  cards: Card[];
  mode: StudyMode;
  flip: FlipSetting;
};

function cardKey(card: Card): string {
  return `${card.front}__${card.back}`;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

export function DeckSessionClient({
  lessonId,
  lessonTitle,
  cards,
  mode,
  flip,
}: DeckSessionClientProps) {
  const router = useRouter();
  const [queue, setQueue] = useState<SessionCard[]>(() => buildQueue(cards));
  const [revealed, setRevealed] = useState(false);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [wrongKeys, setWrongKeys] = useState<Set<string>>(() => new Set());
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [choiceLocked, setChoiceLocked] = useState(false);

  const current = queue[0];

  const promptSide = useMemo(() => {
    return flip === "jp-to-en" ? "front" : "back";
  }, [flip]);

  const answerSide = useMemo(() => {
    return flip === "jp-to-en" ? "back" : "front";
  }, [flip]);

  useEffect(() => {
    if (queue.length !== 0) {
      return;
    }

    const wrongCards = cards.filter((card) => wrongKeys.has(cardKey(card)));
    window.sessionStorage.setItem(
      `deck-results:${lessonId}`,
      JSON.stringify(wrongCards),
    );
    router.replace(`/decks/${lessonId}/session/results`);
  }, [queue, cards, wrongKeys, lessonId, router]);

  const multipleChoice = useMemo(() => {
    if (!current || mode !== "multiple-choice") {
      return null;
    }

    const correct = current.card[answerSide];
    const distractorPool = cards
      .filter((card) => cardKey(card) !== cardKey(current.card))
      .map((card) => card[answerSide])
      .filter((value) => value !== correct);

    const distractors = shuffle(distractorPool).slice(0, 3);
    const options = shuffle(Array.from(new Set([correct, ...distractors])));

    return { options, correct };
  }, [current, mode, answerSide, cards]);

  const moveNextCorrect = () => {
    setRevealed(false);
    setShowAnswerKey(false);
    setSelectedOption(null);
    setChoiceLocked(false);
    setQueue((previous) => answerCorrect(previous));
  };

  const moveNextWrong = () => {
    if (!current) {
      return;
    }

    setWrongKeys((previous) => {
      const next = new Set(previous);
      next.add(cardKey(current.card));
      return next;
    });

    setRevealed(false);
    setShowAnswerKey(false);
    setSelectedOption(null);
    setChoiceLocked(false);
    setQueue((previous) => answerWrong(previous));
  };

  if (!current) {
    return (
      <div className="rounded-2xl border border-rose-900/10 bg-white p-6 text-center">
        <p className="text-base text-slate-700">Preparing session...</p>
      </div>
    );
  }

  const prompt = mode === "typing" ? current.card.front : current.card[promptSide];
  const expectedTyping = current.card.back;

  return (
    <section className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-rose-900/10 bg-white px-3 py-2 sm:px-4 sm:py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-rose-700">
            Now studying
          </p>
          <h2 className="font-display text-xl text-slate-900 sm:text-2xl">
            {lessonTitle}
          </h2>
        </div>
        <p className="text-sm text-slate-700">{queue.length} cards left</p>
      </div>

      <article className="rounded-3xl border border-rose-900/10 bg-white p-4 shadow-sm sm:p-8">
        {mode === "typing" ? (
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              onClick={() => setShowAnswerKey(true)}
              className="rounded-full border border-rose-900/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-rose-800 transition hover:border-rose-900/40 hover:bg-rose-50"
            >
              Answer key
            </button>
          </div>
        ) : null}

        <p className="text-center text-xs uppercase tracking-[0.2em] text-rose-700">
          Prompt
        </p>
        <p className="mt-4 text-center font-display text-5xl leading-tight text-slate-900 sm:text-7xl">
          {prompt}
        </p>

        {mode === "flashcard" ? (
          <div className="mt-8 space-y-4">
            {!revealed ? (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setRevealed(true)}
                  className="rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-slate-700 sm:text-sm"
                >
                  Reveal answer
                </button>
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-50 p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.18em] text-amber-700">
                    Answer
                  </p>
                  <p className="mt-2 text-lg text-slate-900 sm:text-xl">
                    {current.card[answerSide]}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={moveNextCorrect}
                    className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-emerald-500 sm:text-sm"
                  >
                    Got it
                  </button>
                  <button
                    type="button"
                    onClick={moveNextWrong}
                    className="rounded-full bg-rose-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-rose-600 sm:text-sm"
                  >
                    Missed it
                  </button>
                </div>
              </>
            )}
          </div>
        ) : null}

        {mode === "multiple-choice" && multipleChoice ? (
          <div className="mt-8 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {multipleChoice.options.map((option) => {
                const isSelected = selectedOption === option;
                const isCorrect = multipleChoice.correct === option;

                let stateClass =
                  "border-slate-300 bg-white hover:border-slate-500";
                if (choiceLocked) {
                  if (isCorrect) {
                    stateClass =
                      "border-emerald-600 bg-emerald-100 text-emerald-900";
                  } else if (isSelected) {
                    stateClass = "border-rose-600 bg-rose-100 text-rose-900";
                  }
                }

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={choiceLocked}
                    onClick={() => {
                      if (choiceLocked) {
                        return;
                      }
                      setSelectedOption(option);
                      setChoiceLocked(true);
                    }}
                    className={`min-h-20 rounded-2xl border px-3 py-3 text-center text-sm font-medium transition sm:min-h-24 sm:text-base ${stateClass}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {choiceLocked ? (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    const wasCorrect =
                      selectedOption === multipleChoice.correct;
                    if (wasCorrect) {
                      moveNextCorrect();
                    } else {
                      moveNextWrong();
                    }
                  }}
                  className="rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-slate-700 sm:text-sm"
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {mode === "typing" ? (
          <div className="mx-auto mt-8 max-w-2xl">
            <TypingPracticeInput
              key={`${cardKey(current.card)}-${expectedTyping}`}
              expected={expectedTyping}
              label="Type this answer"
              placeholder="Type romaji..."
              showExpected={false}
              onComplete={moveNextCorrect}
              onGiveUp={moveNextWrong}
              giveUpLabel="Give up"
            />
          </div>
        ) : null}
      </article>

      {showAnswerKey ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-rose-900/15 bg-white p-5 shadow-lg">
            <p className="text-xs uppercase tracking-[0.2em] text-rose-700">Answer key</p>
            <h3 className="mt-3 font-display text-3xl text-slate-900">{current.card.front}</h3>
            <p className="mt-2 text-base text-slate-700">{current.card.back}</p>
            <button
              type="button"
              onClick={() => setShowAnswerKey(false)}
              className="mt-5 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between text-sm text-slate-700">
        <p>Wrong cards: {wrongKeys.size}</p>
        <Link
          href={`/decks/${lessonId}`}
          className="underline decoration-rose-400 underline-offset-4"
        >
          Back to settings
        </Link>
      </div>
    </section>
  );
}
