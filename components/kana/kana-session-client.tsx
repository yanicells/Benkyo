"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";

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

// Simple array shuffle
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
  batchSize, // Note: For MC, we might deal with 1 at a time, but to respect batch, let's just do 1 at a time no matter what since MC with batch is confusing, or we ignore batchSize visually for MC mode and just do normal queue.
}: KanaSessionClientProps) {
  const [queue, setQueue] = useState<SessionCard[]>(() => buildQueue(cards));
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [choiceLocked, setChoiceLocked] = useState(false);

  const current = queue[0];
  const complete = isSessionComplete(queue);

  // Generate MC options
  const multipleChoice = useMemo(() => {
    if (!current) return null;

    const correct = current.card.romaji ?? current.card.back;
    const distractorPool = Array.from(new Set(cards.map(c => c.romaji ?? c.back))).filter(v => v !== correct);
    const distractors = shuffle(distractorPool).slice(0, 3);
    const options = shuffle([correct, ...distractors]);

    return { options, correct };
  }, [current, cards]);

  const submitChoice = useCallback(() => {
    if (!multipleChoice || !choiceLocked) return;

    const wasCorrect = selectedOption === multipleChoice.correct;
    if (wasCorrect) {
      setQueue(prev => answerCorrect(prev));
    } else {
      setQueue(prev => answerWrong(prev));
    }

    setSelectedOption(null);
    setChoiceLocked(false);
  }, [multipleChoice, choiceLocked, selectedOption]);

  // Optionally auto-advance on Correct, but wait on wrong
  useEffect(() => {
    if (choiceLocked && selectedOption === multipleChoice?.correct) {
      const timer = setTimeout(() => {
        submitChoice();
      }, 500); // short delay to show green
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
      if (!Number.isNaN(optionIndex) && optionIndex >= 0 && optionIndex <= 3 && !choiceLocked) {
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
      <section className="space-y-4 rounded-xl bg-surface-lowest p-6 text-center shadow-sm sm:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          Complete
        </p>
        <h2 className="font-display text-4xl font-bold text-foreground">Great work</h2>
        <p className="text-sm text-on-surface-variant">You cleared every kana in this set.</p>
        <Link
          href="/kana"
          className="btn-primary-gradient mt-4 mx-auto inline-flex rounded-lg px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
        >
          Back to setup
        </Link>
      </section>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)]">
      <div className="text-center mb-8">
        <h1 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2">Kana Drill</h1>
        <p className="font-display text-2xl font-bold text-foreground">Identify this character</p>
      </div>

      <div className="relative mx-auto w-full max-w-sm rounded-[2rem] bg-surface-lowest p-8 shadow-sm flex flex-col items-center justify-center min-h-[280px]">
         <div className="absolute top-6">
           <span className="px-3 py-1 bg-surface-low rounded-lg text-xs font-bold text-on-surface-variant uppercase tracking-widest">
             {script}
           </span>
         </div>
         
         <div className="font-display text-[120px] leading-none text-foreground mt-8">
           {current.card.front}
         </div>
      </div>

      {multipleChoice && (
        <div className="mt-12 flex flex-col gap-3 max-w-sm mx-auto w-full">
          {multipleChoice.options.map((option, i) => {
            const isSelected = selectedOption === option;
            const isCorrect = multipleChoice.correct === option;

            let stateClass = "bg-surface-lowest text-foreground hover:bg-surface-low border-2 border-transparent";
            let indicator = null;

            if (choiceLocked) {
              if (isCorrect) {
                stateClass = "bg-success border-success text-white shadow-lg";
                indicator = (
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                );
              } else if (isSelected) {
                stateClass = "bg-error border-error text-white shadow-lg";
                indicator = (
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
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
                className={`group relative flex items-center justify-center w-full min-h-[64px] rounded-2xl text-lg font-bold transition-all duration-200 ${stateClass}`}
              >
                {!choiceLocked && (
                  <span className="absolute left-6 text-sm text-on-surface-variant opacity-50 font-display">
                    {i + 1}
                  </span>
                )}
                {option}
                {indicator && (
                   <span className="absolute right-6">
                     {indicator}
                   </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {choiceLocked && selectedOption !== multipleChoice?.correct && (
        <div className="mt-6 flex justify-center max-w-sm mx-auto w-full">
           <button
             onClick={submitChoice}
             className="w-full btn-primary-gradient py-4 rounded-xl text-white font-bold text-sm shadow-md transition hover:opacity-90"
           >
             Continue
           </button>
        </div>
      )}

      <div className="mt-auto pt-10 pb-6 text-center">
        <Link href="/kana" className="inline-flex items-center gap-2 text-xs font-bold text-error hover:text-error/80 uppercase tracking-widest transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Quit Drill
        </Link>
      </div>
    </div>
  );
}
