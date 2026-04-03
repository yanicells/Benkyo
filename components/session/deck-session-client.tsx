"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { answerCorrect, answerWrong, buildQueue } from "@/lib/session";
import { reviewCard, makeCardId, recordDailyReview, updateStreak } from "@/lib/srs";
import type { Card, CardType, FlipSetting, SRSRating, SessionCard, StudyMode } from "@/lib/types";

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
  { rating: 0, label: "Again", key: "1", color: "bg-error text-white hover:opacity-90" },
  { rating: 1, label: "Hard", key: "2", color: "bg-[#e27d60] text-white hover:opacity-90" },
  { rating: 2, label: "Good", key: "3", color: "bg-[#49b3a4] text-white hover:opacity-90" },
  { rating: 3, label: "Easy", key: "4", color: "btn-primary-gradient text-white hover:opacity-90" },
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

  const promptSide = useMemo(() => (flip === "jp-to-en" ? "front" : "back"), [flip]);
  const answerSide = useMemo(() => (flip === "jp-to-en" ? "back" : "front"), [flip]);

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

    window.sessionStorage.setItem(`deck-results:${lessonId}:${subDeckId}`, JSON.stringify(resultsData));

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
        .filter((c) => c.type === "fill-in" && cardKey(c) !== cardKey(current.card))
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
        if (!Number.isNaN(optionIndex) && optionIndex >= 0 && optionIndex <= 3 && !choiceLocked) {
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
  }, [mode, revealed, multipleChoice, choiceLocked, showSRSRating, doSRSReview, submitMultipleChoice]);

  if (!current) {
    return (
      <div className="rounded-xl bg-surface-lowest p-6 text-center shadow-sm">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Preparing session...</p>
      </div>
    );
  }

  const prompt = current.card[promptSide];
  const reviewLabel = reviewLabels?.[currentOriginalIndex];

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)]">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
           <h1 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{lessonTitle}</h1>
           {reviewLabel && (
              <span className="px-2 py-0.5 rounded text-[8px] uppercase tracking-wider bg-secondary-container text-foreground font-bold">
                {reviewLabel}
              </span>
           )}
        </div>
        <p className="font-display text-2xl font-bold text-foreground">
          {mode === 'flashcard' ? 'Recall the meaning' : 'Select the translation'}
        </p>
      </div>

      <div className="relative mx-auto w-full max-w-sm flex-1 flex flex-col justify-center">
        {/* Main Card */}
        <div 
          className={`relative rounded-[2rem] bg-surface-lowest p-8 shadow-sm flex flex-col items-center justify-center transition-all duration-300 ${revealed ? 'min-h-[380px]' : 'min-h-[280px]'}`}
          onClick={() => {
             if (mode === "flashcard" && !revealed) setRevealed(true);
          }}
        >
           <div className="absolute top-6 flex items-center justify-between w-full px-8">
             <span className="px-3 py-1 bg-surface-low rounded-lg text-xs font-bold text-on-surface-variant uppercase tracking-widest flex gap-2">
               <span>{typeIcons[current.card.type]}</span>
               {current.card.type}
             </span>
             <span className="text-xs font-bold text-on-surface-variant/50">
               {queue.length} left
             </span>
           </div>
           
           <div className={`font-display text-center leading-tight text-foreground mt-8 transition-all ${prompt.length > 8 ? 'text-5xl' : 'text-7xl'}`}>
             {prompt}
           </div>
           
           {current.card.hint && (
             <p className="mt-4 text-xs italic text-on-surface-variant opacity-70">
               ({current.card.hint})
             </p>
           )}

           {mode === "flashcard" && revealed && (
             <>
                <div className="w-12 h-[2px] bg-outline-variant/30 my-8"></div>
                <div className="text-center">
                  <p className="font-display text-3xl font-bold text-foreground">
                    {current.card[answerSide]}
                  </p>
                </div>
             </>
           )}
        </div>

        {/* User Controls Area */}
        <div className="mt-8 min-h-[140px] flex flex-col justify-end">
          {mode === "flashcard" && (
            <div className="w-full">
              {!revealed ? (
                <button
                  type="button"
                  onClick={() => setRevealed(true)}
                  className="w-full btn-primary-gradient py-4 rounded-2xl text-white font-bold shadow-md transition hover:opacity-90"
                >
                  Reveal Answer
                </button>
              ) : (
                <div className="flex justify-between gap-3 max-w-sm mx-auto w-full">
                  {ratingButtons.map((btn) => (
                    <button
                      key={btn.rating}
                      type="button"
                      onClick={() => doSRSReview(btn.rating)}
                      className={`flex-1 flex flex-col items-center py-3 rounded-2xl transition shadow-sm ${btn.color}`}
                    >
                      <span className="text-[10px] font-bold opacity-70 mb-1">{btn.key}</span>
                      <span className="text-sm font-bold">{btn.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {mode === "multiple-choice" && multipleChoice && (
            <div className="w-full">
               {!showSRSRating ? (
                  <div className="grid grid-cols-1 gap-3 max-w-sm mx-auto">
                    {multipleChoice.options.map((option, i) => {
                      const isSelected = selectedOption === option;
                      const isCorrect = multipleChoice.correct === option;

                      let stateClass = "bg-surface-lowest text-foreground hover:bg-surface-low border-2 border-transparent";
                      if (choiceLocked) {
                        if (isCorrect) stateClass = "bg-success border-success text-white shadow-lg";
                        else if (isSelected) stateClass = "bg-error border-error text-white shadow-lg";
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
                            <span className="absolute left-6 text-sm text-on-surface-variant opacity-50 font-display">{i + 1}</span>
                          )}
                          {option}
                        </button>
                      );
                    })}
                    
                    {choiceLocked && (
                      <button
                        type="button"
                        onClick={submitMultipleChoice}
                        className="mt-2 w-full btn-primary-gradient py-4 rounded-xl text-white font-bold text-sm shadow-md transition hover:opacity-90"
                      >
                        Continue
                      </button>
                    )}
                  </div>
               ) : (
                 // After correct MC answer, show SRS Ratings
                 <div className="w-full max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-4">
                    <p className="text-center text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-4">
                      How difficult was this?
                    </p>
                    <div className="flex justify-center gap-3">
                      {ratingButtons.filter(b => b.rating >= 2).map((btn) => (
                        <button
                          key={btn.rating}
                          type="button"
                          onClick={() => doSRSReview(btn.rating)}
                          className={`flex-1 flex flex-col items-center py-3 rounded-2xl transition shadow-sm ${btn.color}`}
                        >
                          <span className="text-[10px] font-bold opacity-70 mb-1">{btn.key}</span>
                          <span className="text-sm font-bold">{btn.label}</span>
                        </button>
                      ))}
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 pt-4 pb-6 text-center flex justify-center">
        <Link 
          href={isReview ? "/review" : `/decks/${lessonId}/${subDeckId}`} 
          className="inline-flex items-center gap-2 text-xs font-bold text-error hover:text-error/80 uppercase tracking-widest transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Quit Session
        </Link>
      </div>
    </div>
  );
}
