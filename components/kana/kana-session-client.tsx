"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

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

type KanaSessionClientProps = {
  script: KanaScript;
  groups: KanaSelectionKey[];
  cards: Card[];
  batchSize: KanaBatchSize;
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function KanaSessionClient({
  script,
  groups,
  cards,
  batchSize,
}: KanaSessionClientProps) {
  const [queue, setQueue] = useState<SessionCard[]>(() => buildQueue(cards));
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [choiceLocked, setChoiceLocked] = useState(false);

  const current = queue[0];
  const complete = isSessionComplete(queue);

  const multipleChoice = useMemo(() => {
    if (!current) return null;

    const correct = current.card.romaji ?? current.card.back;
    const distractorPool = Array.from(
      new Set(cards.map((c) => c.romaji ?? c.back)),
    ).filter((value) => value !== correct);
    const distractors = shuffle(distractorPool).slice(0, 3);
    const options = shuffle([correct, ...distractors]);

    return { options, correct };
  }, [current, cards]);

  const submitChoice = useCallback(() => {
    if (!multipleChoice || !choiceLocked) return;

    const wasCorrect = selectedOption === multipleChoice.correct;
    if (wasCorrect) {
      setQueue((prev) => answerCorrect(prev));
    } else {
      setQueue((prev) => answerWrong(prev));
    }

    setSelectedOption(null);
    setChoiceLocked(false);
  }, [multipleChoice, choiceLocked, selectedOption]);

  useEffect(() => {
    if (choiceLocked && selectedOption === multipleChoice?.correct) {
      const timer = setTimeout(() => {
        submitChoice();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [choiceLocked, selectedOption, multipleChoice, submitChoice]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (complete || !multipleChoice) return;

      if (event.key === "Enter" && choiceLocked) {
        event.preventDefault();
        submitChoice();
        return;
      }

      const optionIndex = Number.parseInt(event.key, 10) - 1;
      if (
        !Number.isNaN(optionIndex) &&
        optionIndex >= 0 &&
        optionIndex <= 3 &&
        !choiceLocked
      ) {
        const option = multipleChoice.options[optionIndex];
        if (option) {
          event.preventDefault();
          setSelectedOption(option);
          setChoiceLocked(true);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [complete, multipleChoice, choiceLocked, submitChoice]);

  if (complete || !current) {
    return (
      <section className="space-y-4 rounded-[2rem] bg-surface-lowest p-10 text-center shadow-[0_4px_24px_rgba(0,14,33,0.04)] sm:p-16 max-w-2xl mx-auto my-12">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          Complete
        </p>
        <h2 className="font-display text-5xl font-bold text-foreground">
          Great work
        </h2>
        <p className="text-sm text-on-surface-variant font-medium">
          You identified every kana perfectly.
        </p>
        <Link
          href="/kana"
          className="btn-primary-gradient mt-8 mx-auto inline-flex rounded-xl px-8 py-4 text-sm font-bold text-white transition hover:opacity-90 shadow-[0_8px_20px_rgba(0,36,70,0.12)] hover:-translate-y-1"
        >
          Return to Dashboard
        </Link>
      </section>
    );
  }

  const prompt = current.card.front;
  const total = cards.length;
  const answered = total - (queue.length > total ? total : queue.length);
  const progressPercent = Math.max(
    0,
    Math.min(100, Math.round((answered / total) * 100)),
  );
  const selectedRowCount = groups.length;

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8 w-full flex flex-col min-h-screen relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-outline-variant/30 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              {script} Drill
            </h1>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-2">
            {selectedRowCount} rows • batch {batchSize}
          </p>
          <p className="font-display text-4xl lg:text-5xl font-bold text-foreground">
            Interactive Learning
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-1 h-1.5 w-32 rounded-full overflow-hidden bg-secondary-container">
            <div
              className="h-full bg-success transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] uppercase font-bold text-success tracking-widest whitespace-nowrap">
            {answered}/{total} Done
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="relative rounded-[2rem] bg-surface-lowest p-10 lg:p-16 shadow-[0_4px_24px_rgba(0,14,33,0.04)] flex flex-col items-center justify-center min-h-[380px] transition-all">
            <div className="absolute top-6 left-6">
              <div className="w-10 h-10 rounded-xl bg-surface-low flex items-center justify-center text-primary transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              </div>
            </div>

            <div className="font-display text-[140px] md:text-[200px] leading-none text-foreground">
              {prompt}
            </div>
          </div>

          {multipleChoice && (
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {multipleChoice.options.map((option, i) => {
                  const isSelected = selectedOption === option;
                  const isCorrect = multipleChoice.correct === option;

                  let stateClass =
                    "bg-surface-lowest text-foreground hover:bg-surface-low border-2 border-transparent";
                  let indicator = null;

                  if (choiceLocked) {
                    if (isCorrect) {
                      stateClass =
                        "bg-success border-success text-white shadow-lg";
                      indicator = (
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      );
                    } else if (isSelected) {
                      stateClass = "bg-error border-error text-white shadow-lg";
                      indicator = (
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      );
                    }
                  }

                  return (
                    <button
                      key={`${option}-${i}`}
                      type="button"
                      disabled={choiceLocked}
                      onClick={() => {
                        if (choiceLocked) return;
                        setSelectedOption(option);
                        setChoiceLocked(true);
                      }}
                      className={`group relative flex items-center justify-center w-full min-h-[80px] rounded-[1.5rem] text-xl font-bold transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.04)] ${stateClass}`}
                    >
                      {!choiceLocked && (
                        <span className="absolute left-6 text-sm text-on-surface-variant opacity-50 font-display">
                          {i + 1}
                        </span>
                      )}
                      {option}
                      {indicator && (
                        <span className="absolute right-6">{indicator}</span>
                      )}
                    </button>
                  );
                })}

                {choiceLocked && selectedOption !== multipleChoice.correct && (
                  <button
                    type="button"
                    onClick={submitChoice}
                    className="md:col-span-2 mt-4 w-full btn-primary-gradient py-5 rounded-[1.5rem] text-white font-bold text-lg shadow-[0_8px_20px_rgba(0,36,70,0.12)] transition hover:opacity-90 hover:shadow-lg animate-in slide-in-from-bottom-2"
                  >
                    Continue
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2">
            Character Reference
          </h3>

          <div className="bg-[#e4f3ed] rounded-2xl p-5 flex items-center justify-between shadow-sm relative overflow-hidden group border border-[#2a9a8c]/10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-success shadow-sm">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-foreground text-lg group-hover:text-success transition-colors">
                  {multipleChoice?.correct}
                </h4>
                <p className="text-[10px] text-on-surface-variant font-bold opacity-70 uppercase tracking-widest">
                  Romaji
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#001736] rounded-2xl p-6 shadow-lg text-white mt-4 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-10 text-[180px] font-display font-bold text-white/5 pointer-events-none select-none leading-none z-0">
              {prompt}
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-4 h-4 text-[#8ef4e4]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.3 3-3.4 3-5.7 0-3.9-3.1-7-7-7z" />
                </svg>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">
                  Writing Tip
                </span>
              </div>
              <p className="text-sm text-white/80 leading-relaxed font-light mb-6">
                Note the subtle curve and thickness on the terminating stroke.
                Practice keeping the balance proportional to the center axis.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/kana"
              className="w-full inline-flex items-center justify-center font-bold text-xs uppercase tracking-widest text-[#2a9a8c] hover:text-[#2a9a8c]/80 transition-colors py-4 gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              End Session Early
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
