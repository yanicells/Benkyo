"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { answerCorrect, answerWrong, buildQueue } from "@/lib/session";
import {
  reviewCard,
  makeCardId,
  recordDailyReview,
  updateStreak,
} from "@/lib/srs";
import type {
  Card,
  CardType,
  FlipSetting,
  SRSRating,
  SessionCard,
  StudyMode,
} from "@/lib/types";

type DeckSessionClientProps = {
  lessonId: string;
  subDeckId: string;
  lessonTitle: string;
  cards: Card[];
  mode: StudyMode;
  flip: FlipSetting;
  cardSubDeckIds: string[];
  cardIndexes: number[];
  allLessonCards: Card[];
  isReview?: boolean;
  reviewLabels?: string[];
};

const typeIcons: Record<CardType, string> = {
  vocab: "語",
  grammar: "文",
  "fill-in": "✎",
  conjugation: "変",
  translate: "訳",
  culture: "文化",
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

const ratingButtons: { rating: SRSRating; label: string; key: string; color: string }[] = [
  { rating: 0, label: "Again", key: "1", color: "bg-red-600 hover:bg-red-500" },
  { rating: 1, label: "Hard", key: "2", color: "bg-amber-600 hover:bg-amber-500" },
  { rating: 2, label: "Good", key: "3", color: "bg-emerald-600 hover:bg-emerald-500" },
  { rating: 3, label: "Easy", key: "4", color: "bg-sky-600 hover:bg-sky-500" },
];

export function DeckSessionClient({
  lessonId,
  subDeckId,
  lessonTitle,
  cards,
  mode,
  flip,
  cardSubDeckIds,
  cardIndexes,
  allLessonCards,
  isReview = false,
  reviewLabels,
}: DeckSessionClientProps) {
  const router = useRouter();
  const [queue, setQueue] = useState<SessionCard[]>(() => buildQueue(cards));
  const [revealed, setRevealed] = useState(false);
  const [wrongKeys, setWrongKeys] = useState<Set<string>>(() => new Set());
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [choiceLocked, setChoiceLocked] = useState(false);
  const [showSRSRating, setShowSRSRating] = useState(false);
  const sessionStart = useRef(0);
  const cardStart = useRef(0);
  const totalReviewed = useRef(0);
  const totalCorrectRef = useRef(0);

  useEffect(() => {
    sessionStart.current = Date.now();
    cardStart.current = Date.now();
  }, []);

  const current = queue[0];

  const currentOriginalIndex = useMemo(() => {
    if (!current) return -1;
    return cards.indexOf(current.card);
  }, [current, cards]);

  const promptSide = useMemo(() => {
    return flip === "jp-to-en" ? "front" : "back";
  }, [flip]);

  const answerSide = useMemo(() => {
    return flip === "jp-to-en" ? "back" : "front";
  }, [flip]);

  // Navigate to results when session is complete
  useEffect(() => {
    if (queue.length !== 0) return;

    const wrongCards = cards.filter((card) => wrongKeys.has(cardKey(card)));
    const elapsed = Math.round((Date.now() - sessionStart.current) / 1000);

    const resultsData = {
      wrongCards,
      totalReviewed: totalReviewed.current,
      totalCorrect: totalCorrectRef.current,
      timeSeconds: elapsed,
    };

    window.sessionStorage.setItem(
      `deck-results:${lessonId}:${subDeckId}`,
      JSON.stringify(resultsData),
    );

    if (isReview) {
      router.replace("/review/session/results");
    } else {
      router.replace(`/decks/${lessonId}/${subDeckId}/session/results`);
    }
  }, [queue, cards, wrongKeys, lessonId, subDeckId, router, isReview]);

  // Generate MC options
  const multipleChoice = useMemo(() => {
    if (!current || mode !== "multiple-choice") return null;

    const isFillIn = current.card.type === "fill-in";
    const correct = current.card[answerSide];

    let distractorPool: string[];

    if (isFillIn) {
      // For fill-in: pull from other fill-in cards' back values
      distractorPool = allLessonCards
        .filter(
          (c) =>
            c.type === "fill-in" && cardKey(c) !== cardKey(current.card),
        )
        .map((c) => c.back)
        .filter((v) => v !== correct);
    } else {
      distractorPool = allLessonCards
        .filter((card) => cardKey(card) !== cardKey(current.card))
        .map((card) => card[answerSide])
        .filter((value) => value !== correct);
    }

    const distractors = shuffle(distractorPool).slice(0, 3);
    const options = shuffle(Array.from(new Set([correct, ...distractors])));

    return { options, correct };
  }, [current, mode, answerSide, allLessonCards]);

  const doSRSReview = useCallback(
    (rating: SRSRating) => {
      if (!current || currentOriginalIndex < 0) return;

      const sdId = cardSubDeckIds[currentOriginalIndex];
      const idx = cardIndexes[currentOriginalIndex];

      if (sdId !== undefined && idx !== undefined) {
        const srsCardId = makeCardId(sdId, idx);
        reviewCard(srsCardId, rating);
      }

      const elapsed = Math.round((Date.now() - cardStart.current) / 1000);
      const isCorrect = rating >= 2;
      recordDailyReview(isCorrect, elapsed);
      updateStreak();
      totalReviewed.current += 1;
      if (isCorrect) totalCorrectRef.current += 1;

      // Update queue
      if (isCorrect) {
        setQueue((prev) => answerCorrect(prev));
      } else {
        if (current) {
          setWrongKeys((prev) => {
            const next = new Set(prev);
            next.add(cardKey(current.card));
            return next;
          });
        }
        setQueue((prev) => answerWrong(prev));
      }

      // Reset state
      setRevealed(false);
      setSelectedOption(null);
      setChoiceLocked(false);
      setShowSRSRating(false);

      cardStart.current = Date.now();
    },
    [current, currentOriginalIndex, cardSubDeckIds, cardIndexes],
  );

  // MC submit: lock + show rating
  const submitMultipleChoice = useCallback(() => {
    if (!multipleChoice || !choiceLocked) return;

    const wasCorrect = selectedOption === multipleChoice.correct;
    if (wasCorrect) {
      // Correct answer = show Good/Easy choice
      setShowSRSRating(true);
    } else {
      // Wrong answer = auto-rate Again
      doSRSReview(0);
    }
  }, [multipleChoice, choiceLocked, selectedOption, doSRSReview]);

  // Keyboard handler
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // SRS rating mode
      if (showSRSRating) {
        const num = Number.parseInt(event.key, 10);
        if (num >= 1 && num <= 4) {
          event.preventDefault();
          doSRSReview((num - 1) as SRSRating);
        }
        return;
      }

      if (mode === "flashcard") {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (!revealed) {
            setRevealed(true);
          }
          return;
        }

        if (revealed) {
          const num = Number.parseInt(event.key, 10);
          if (num >= 1 && num <= 4) {
            event.preventDefault();
            doSRSReview((num - 1) as SRSRating);
          }
        }
        return;
      }

      if (mode === "multiple-choice" && multipleChoice) {
        if (event.key === "Enter") {
          if (choiceLocked && !showSRSRating) {
            event.preventDefault();
            submitMultipleChoice();
          }
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
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    mode,
    revealed,
    multipleChoice,
    choiceLocked,
    showSRSRating,
    doSRSReview,
    submitMultipleChoice,
  ]);

  if (!current) {
    return (
      <div className="rounded-2xl border border-rose-900/10 bg-white p-6 text-center">
        <p className="text-base text-slate-700">Preparing session...</p>
      </div>
    );
  }

  const prompt = current.card[promptSide];
  const reviewLabel = reviewLabels?.[currentOriginalIndex];

  return (
    <section className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-rose-900/10 bg-white px-3 py-2 sm:px-4 sm:py-3">
        <div className="min-w-0">
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
        <div className="mb-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-800">
            <span>{typeIcons[current.card.type]}</span>
            <span className="uppercase tracking-wider">{current.card.type}</span>
          </span>
          {reviewLabel && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              {reviewLabel}
            </span>
          )}
        </div>

        <p className="mt-2 text-center text-xs uppercase tracking-[0.2em] text-rose-700">
          Prompt
        </p>
        <p className="mt-4 text-center font-display text-4xl leading-tight text-slate-900 sm:text-7xl">
          {prompt}
        </p>

        {current.card.hint && (
          <p className="mt-3 text-center text-sm text-slate-500 italic">
            Hint: {current.card.hint}
          </p>
        )}

        {/* Flashcard mode */}
        {mode === "flashcard" && (
          <div className="mt-8 space-y-4">
            {!revealed ? (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setRevealed(true)}
                  className="min-h-11 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-slate-700"
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
                  <p className="mt-2 font-display text-2xl text-slate-900 sm:text-3xl">
                    {current.card[answerSide]}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {ratingButtons.map((btn) => (
                    <button
                      key={btn.rating}
                      type="button"
                      onClick={() => doSRSReview(btn.rating)}
                      className={`min-h-11 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.14em] text-white transition ${btn.color}`}
                    >
                      <span className="mr-1 opacity-60">{btn.key}</span>
                      {btn.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Multiple choice mode */}
        {mode === "multiple-choice" && multipleChoice && (
          <div className="mt-8 space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {multipleChoice.options.map((option, i) => {
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
                    key={`${option}-${i}`}
                    type="button"
                    disabled={choiceLocked}
                    onClick={() => {
                      if (choiceLocked) return;
                      setSelectedOption(option);
                      setChoiceLocked(true);
                    }}
                    className={`font-display min-h-20 rounded-2xl border px-3 py-3 text-center text-lg transition sm:min-h-24 sm:text-xl ${stateClass}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {choiceLocked && !showSRSRating && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={submitMultipleChoice}
                  className="min-h-11 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-slate-700"
                >
                  Next
                </button>
              </div>
            )}

            {showSRSRating && (
              <div className="space-y-2">
                <p className="text-center text-xs uppercase tracking-wider text-slate-600">
                  How well did you know this?
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {ratingButtons
                    .filter((b) => b.rating >= 2)
                    .map((btn) => (
                      <button
                        key={btn.rating}
                        type="button"
                        onClick={() => doSRSReview(btn.rating)}
                        className={`min-h-11 rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.14em] text-white transition ${btn.color}`}
                      >
                        <span className="mr-1 opacity-60">{btn.key}</span>
                        {btn.label}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </article>

      <div className="flex items-center justify-between text-sm text-slate-700">
        <p>Wrong cards: {wrongKeys.size}</p>
        <Link
          href={
            isReview ? "/review" : `/decks/${lessonId}/${subDeckId}`
          }
          className="underline decoration-rose-400 underline-offset-4"
        >
          Back to settings
        </Link>
      </div>
    </section>
  );
}
