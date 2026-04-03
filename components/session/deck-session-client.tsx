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

const ratingButtons: {
  rating: SRSRating;
  label: string;
  key: string;
  color: string;
}[] = [
  {
    rating: 0,
    label: "Again",
    key: "1",
    color: "bg-error text-white hover:opacity-90",
  },
  {
    rating: 1,
    label: "Hard",
    key: "2",
    color: "bg-[#e27d60] text-white hover:opacity-90",
  },
  {
    rating: 2,
    label: "Good",
    key: "3",
    color: "bg-[#49b3a4] text-white hover:opacity-90",
  },
  {
    rating: 3,
    label: "Easy",
    key: "4",
    color: "btn-primary-gradient text-white hover:opacity-90",
  },
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

  const promptSide = useMemo(
    () => (flip === "jp-to-en" ? "front" : "back"),
    [flip],
  );
  const answerSide = useMemo(
    () => (flip === "jp-to-en" ? "back" : "front"),
    [flip],
  );

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

  const multipleChoice = useMemo(() => {
    if (!current || mode !== "multiple-choice") return null;

    const isFillIn = current.card.type === "fill-in";
    const correct = current.card[answerSide];

    let distractorPool: string[];

    if (isFillIn) {
      distractorPool = allLessonCards
        .filter(
          (c) => c.type === "fill-in" && cardKey(c) !== cardKey(current.card),
        )
        .map((c) => c[answerSide])
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

      setRevealed(false);
      setSelectedOption(null);
      setChoiceLocked(false);
      setShowSRSRating(false);
      cardStart.current = Date.now();
    },
    [current, currentOriginalIndex, cardSubDeckIds, cardIndexes],
  );

  const submitMultipleChoice = useCallback(() => {
    if (!multipleChoice || !choiceLocked) return;

    const wasCorrect = selectedOption === multipleChoice.correct;
    if (wasCorrect) {
      setShowSRSRating(true);
    } else {
      doSRSReview(0);
    }
  }, [multipleChoice, choiceLocked, selectedOption, doSRSReview]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
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
          if (!revealed) setRevealed(true);
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
      <div className="rounded-xl bg-surface-lowest p-6 text-center shadow-sm">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">
          Preparing session...
        </p>
      </div>
    );
  }

  const prompt = current.card[promptSide];
  const total = cards.length;
  // Use queue.length and total to show progress
  const answered = total - (queue.length > total ? total : queue.length);
  const progressPercent = Math.max(
    0,
    Math.min(100, Math.round((answered / total) * 100)),
  );
  const currentTypeIcon = typeIcons[current.card.type];
  const reviewLabel =
    isReview && currentOriginalIndex >= 0
      ? reviewLabels?.[currentOriginalIndex]
      : undefined;

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8 w-full flex flex-col min-h-screen relative">
      {/* Session Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-outline-variant/30 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-low text-sm text-primary">
              {currentTypeIcon}
            </span>
            <h1 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              {lessonTitle}
            </h1>
          </div>
          {reviewLabel && (
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant mb-2">
              {reviewLabel}
            </p>
          )}
          <p className="font-display text-4xl lg:text-5xl font-bold text-foreground">
            Interactive Learning
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-1 h-1.5 w-32 rounded-full overflow-hidden bg-secondary-container">
            <div
              className="h-full bg-success transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="text-[10px] uppercase font-bold text-success tracking-widest whitespace-nowrap">
            {answered}/{total} Done
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1">
        {/* Left Column (Main Card Display) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div
            className={`relative rounded-[2rem] bg-surface-lowest p-10 lg:p-16 shadow-[0_4px_24px_rgba(0,14,33,0.04)] flex flex-col items-center justify-center transition-all duration-300 ${revealed ? "min-h-[440px]" : "min-h-[380px]"}`}
            onClick={() => {
              if (mode === "flashcard" && !revealed) setRevealed(true);
            }}
          >
            <div className="absolute top-6 left-6">
              <div className="w-10 h-10 rounded-xl bg-surface-low flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              </div>
            </div>

            <div
              className={`font-display text-center leading-tight text-foreground transition-all ${prompt.length > 6 ? "text-6xl md:text-8xl" : "text-8xl md:text-[160px]"}`}
            >
              {prompt}
            </div>

            {current.card.hint && (
              <p className="mt-8 text-sm italic text-on-surface-variant font-bold uppercase tracking-widest">
                {current.card.hint}
              </p>
            )}

            {mode === "flashcard" && revealed && (
              <div className="animate-in fade-in slide-in-from-bottom-4 mt-8 w-full flex flex-col items-center">
                <div className="w-24 h-[2px] bg-outline-variant/30 my-6"></div>
                <h3 className="font-display text-4xl lg:text-5xl font-bold text-foreground">
                  {current.card[answerSide]}
                </h3>
              </div>
            )}
          </div>

          {/* Controls mapped below the card for flashcard mode */}
          {mode === "flashcard" && (
            <div className="w-full">
              {!revealed ? (
                <button
                  type="button"
                  onClick={() => setRevealed(true)}
                  className="w-full btn-primary-gradient py-5 rounded-[1.5rem] text-white font-bold text-lg shadow-[0_8px_20px_rgba(0,36,70,0.12)] transition hover:opacity-90 hover:shadow-lg"
                >
                  Reveal Answer
                </button>
              ) : (
                <div className="flex justify-between gap-4 w-full">
                  {ratingButtons.map((btn) => (
                    <button
                      key={btn.rating}
                      type="button"
                      onClick={() => doSRSReview(btn.rating)}
                      className={`flex-1 flex flex-col items-center py-4 rounded-[1.5rem] transition shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-1 ${btn.color}`}
                    >
                      <span className="text-xs font-bold opacity-70 mb-1">
                        {btn.key}
                      </span>
                      <span className="text-base font-bold">{btn.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {mode === "multiple-choice" && multipleChoice && (
            <div className="w-full">
              {!showSRSRating ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {multipleChoice.options.map((option, i) => {
                    const isSelected = selectedOption === option;
                    const isCorrect = multipleChoice.correct === option;

                    let stateClass =
                      "bg-surface-lowest text-foreground hover:bg-surface-low border-2 border-transparent";
                    if (choiceLocked) {
                      if (isCorrect)
                        stateClass =
                          "bg-success border-success text-white shadow-lg";
                      else if (isSelected)
                        stateClass =
                          "bg-error border-error text-white shadow-lg";
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
                      </button>
                    );
                  })}

                  {choiceLocked && (
                    <button
                      type="button"
                      onClick={submitMultipleChoice}
                      className="md:col-span-2 mt-4 w-full btn-primary-gradient py-5 rounded-[1.5rem] text-white font-bold text-lg shadow-[0_8px_20px_rgba(0,36,70,0.12)] transition hover:opacity-90 hover:shadow-lg animate-in slide-in-from-bottom-2"
                    >
                      Continue
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-full animate-in fade-in slide-in-from-bottom-4 bg-surface-lowest p-6 rounded-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                  <p className="text-center text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6">
                    How difficult was this?
                  </p>
                  <div className="flex justify-center gap-4">
                    {ratingButtons
                      .filter((b) => b.rating >= 2)
                      .map((btn) => (
                        <button
                          key={btn.rating}
                          type="button"
                          onClick={() => doSRSReview(btn.rating)}
                          className={`flex-1 flex flex-col items-center py-4 rounded-xl transition shadow-sm hover:-translate-y-1 ${btn.color}`}
                        >
                          <span className="text-xs font-bold opacity-70 mb-1">
                            {btn.key}
                          </span>
                          <span className="text-sm font-bold">{btn.label}</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column (Linked Vocab & Context) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2">
            Linked Vocabulary
          </h3>

          {/* Stubs derived from the mockup context */}
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
                  {prompt}曜日
                </h4>
                <p className="text-[10px] text-on-surface-variant font-bold opacity-70">
                  Mokuyōbi • Thursday
                </p>
              </div>
            </div>
            <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-secondary hover:text-primary transition-colors focus:outline-none">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
            </button>
          </div>

          <div className="bg-surface-lowest rounded-2xl p-5 flex items-center justify-between shadow-sm border border-outline-variant/5">
            <div className="flex items-center gap-4">
              <span className="text-secondary text-xs font-bold w-6 opacity-60">
                02
              </span>
              <div>
                <h4 className="font-bold text-foreground text-lg">
                  大{prompt}
                </h4>
                <p className="text-[10px] text-on-surface-variant font-bold opacity-70">
                  Taiki • Large tree
                </p>
              </div>
            </div>
            <button className="w-8 h-8 rounded-full bg-surface-low flex items-center justify-center text-secondary hover:text-primary transition-colors focus:outline-none">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
            </button>
          </div>

          <div className="bg-surface-lowest rounded-2xl p-5 flex items-center justify-between shadow-sm border border-outline-variant/5">
            <div className="flex items-center gap-4">
              <span className="text-secondary text-xs font-bold w-6 opacity-60">
                03
              </span>
              <div>
                <h4 className="font-bold text-foreground text-lg">
                  {prompt}材
                </h4>
                <p className="text-[10px] text-on-surface-variant font-bold opacity-70">
                  Mokuzai • Lumber
                </p>
              </div>
            </div>
            <button className="w-8 h-8 rounded-full bg-surface-low flex items-center justify-center text-secondary hover:text-primary transition-colors focus:outline-none">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
            </button>
          </div>

          <div className="bg-[#001736] rounded-2xl p-6 shadow-lg text-white mt-4 relative overflow-hidden">
            {/* Huge background kanji */}
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
                  Mnemonics Tip
                </span>
              </div>
              <p className="text-sm text-white/80 leading-relaxed font-light mb-6">
                Imagine the horizontal stroke as the ground and the vertical
                stroke with its branches as a growing tree. Simple and rooted.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-8">
            <Link
              href={isReview ? "/review" : `/decks/${lessonId}/${subDeckId}`}
              className="w-full inline-flex items-center justify-center font-bold text-xs uppercase tracking-widest text-[#2a9a8c] hover:text-[#2a9a8c]/80 transition-colors py-4"
            >
              Skip for now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
