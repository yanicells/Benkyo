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

export function DeckSessionClient({ lessonId, lessonTitle, cards, mode, flip }: DeckSessionClientProps) {
  const router = useRouter();
  const [queue, setQueue] = useState<SessionCard[]>(() => buildQueue(cards));
  const [revealed, setRevealed] = useState(false);
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
    if (queue.length === 0) {
      const wrongCards = cards.filter((card) => wrongKeys.has(cardKey(card)));
      window.sessionStorage.setItem(`deck-results:${lessonId}`, JSON.stringify(wrongCards));
      router.replace(`/decks/${lessonId}/session/results`);
    }
  }, [queue, cards, wrongKeys, lessonId, router]);

  const choiceFeedback = useMemo(() => {
    if (!current || mode !== "multiple-choice") {
      return { options: [], correct: null as string | null };
    }

    const correctAnswer = current.card[answerSide];
    const distractorPool = cards
      .filter((card) => cardKey(card) !== cardKey(current.card))
      .map((card) => card[answerSide])
      .filter((value) => value !== correctAnswer);
    const distractors = shuffle(distractorPool).slice(0, 3);
    const options = shuffle(Array.from(new Set([correctAnswer, ...distractors])));

    return { options, correct: correctAnswer };
  }, [current, mode, answerSide, cards]);

  const handleCorrect = () => {
    setRevealed(false);
    setSelectedOption(null);
    setChoiceLocked(false);
    setQueue((previous) => answerCorrect(previous));
  };

  const handleWrong = () => {
    if (!current) {
      return;
    }

    setWrongKeys((previous) => {
      const next = new Set(previous);
      next.add(cardKey(current.card));
      return next;
    });

    setRevealed(false);
    setSelectedOption(null);
    setChoiceLocked(false);
    setQueue((previous) => answerWrong(previous));
  };

  if (!current) {
    return (
      <div className="rounded-2xl border border-rose-900/10 bg-white/70 p-8 text-center">
        <p className="text-lg text-slate-700">Finalizing your results...</p>
      </div>
    );
  }

  const prompt = mode === "typing" ? current.card.front : current.card[promptSide];
  const expectedTyping = flip === "jp-to-en" ? current.card.back : current.card.front;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-900/10 bg-white/70 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-rose-700">Now studying</p>
          <h2 className="font-display text-2xl text-slate-900">{lessonTitle}</h2>
        </div>
        <p className="text-sm text-slate-700">{queue.length} cards remaining</p>
      </div>

      <article className="rounded-3xl border border-rose-900/10 bg-gradient-to-br from-white to-rose-50 p-6 shadow-lg sm:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-rose-700">Prompt</p>
        <p className="mt-4 font-display text-4xl text-slate-900 sm:text-5xl">{prompt}</p>

        {mode === "flashcard" ? (
          <div className="mt-8 space-y-5">
            {!revealed ? (
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-slate-700"
              >
                Reveal answer
              </button>
            ) : (
              <div className="space-y-5">
                <div className="rounded-2xl border border-amber-500/20 bg-amber-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-amber-700">Answer</p>
                  <p className="mt-2 text-xl text-slate-900">{current.card[answerSide]}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleCorrect}
                    className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-emerald-500"
                  >
                    Got it
                  </button>
                  <button
                    type="button"
                    onClick={handleWrong}
                    className="rounded-full bg-rose-700 px-5 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-rose-600"
                  >
                    Missed it
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {mode === "multiple-choice" ? (
          <div className="mt-8 grid gap-3">
            {choiceFeedback.options.map((option) => {
              const isSelected = selectedOption === option;
              const isCorrect = choiceFeedback.correct === option;

              let stateClass = "border-slate-300 bg-white hover:border-slate-500";
              if (choiceLocked) {
                if (isCorrect) {
                  stateClass = "border-emerald-600 bg-emerald-100 text-emerald-900";
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
                    if (choiceLocked || !choiceFeedback.correct) {
                      return;
                    }

                    const wasCorrect = option === choiceFeedback.correct;
                    setSelectedOption(option);
                    setChoiceLocked(true);

                    window.setTimeout(() => {
                      if (wasCorrect) {
                        handleCorrect();
                      } else {
                        handleWrong();
                      }
                    }, wasCorrect ? 380 : 700);
                  }}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition sm:text-base ${stateClass}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        ) : null}

        {mode === "typing" ? (
          <div className="mt-8">
            <TypingPracticeInput
              key={`${cardKey(current.card)}-${expectedTyping}`}
              expected={expectedTyping}
              label="Type this answer"
              placeholder="Type romaji..."
              onComplete={handleCorrect}
              onGiveUp={handleWrong}
              giveUpLabel="Give up"
            />
          </div>
        ) : null}
      </article>

      <div className="flex items-center justify-between text-sm text-slate-700">
        <p>Wrong cards tracked: {wrongKeys.size}</p>
        <Link href={`/decks/${lessonId}`} className="underline decoration-rose-400 underline-offset-4">
          Back to settings
        </Link>
      </div>
    </section>
  );
}
