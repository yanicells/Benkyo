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

/* ── Context Modal ── */
function ContextModal({
  open,
  onClose,
  card,
  relatedCards,
  prompt,
}: {
  open: boolean;
  onClose: () => void;
  card: Card;
  relatedCards: Card[];
  prompt: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/20" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface-lowest rounded-2xl shadow-[0_24px_64px_rgba(0,14,33,0.2)] overflow-hidden max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10 shrink-0">
          <h3 className="font-display text-lg font-bold text-foreground">Card Context</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-low transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {/* Hint / Study tip */}
          <div className="bg-[#001736] rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute -right-4 -bottom-8 font-display text-[120px] font-bold text-white/5 pointer-events-none select-none leading-none">
              {prompt}
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-[#8ef4e4]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.3 3-3.4 3-5.7 0-3.9-3.1-7-7-7z" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-widest text-white/90">
                  {card.hint ? "Card Hint" : "Study Tip"}
                </span>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                {card.hint ??
                  "Review this card carefully. Notice patterns and connections to what you already know."}
              </p>
            </div>
          </div>

          {/* Related cards */}
          {relatedCards.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-3">
                Related Cards
              </p>
              <div className="space-y-2">
                {relatedCards.map((rc, i) => (
                  <div
                    key={i}
                    className="bg-surface-low rounded-xl p-4 flex items-center gap-3"
                  >
                    <span className="text-secondary text-xs font-bold w-5 shrink-0 opacity-60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-japanese font-bold text-foreground text-base truncate">
                        {rc.front}
                      </p>
                      <p className="text-xs text-on-surface-variant truncate mt-0.5">
                        {rc.back}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
  const [contextOpen, setContextOpen] = useState(false);
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

  const relatedCards = useMemo(() => {
    if (currentOriginalIndex < 0) return [];
    return cards.filter((_, i) => i !== currentOriginalIndex).slice(0, 3);
  }, [currentOriginalIndex, cards]);

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
      <div className="max-w-screen-md mx-auto px-4 py-20 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">
          Preparing session...
        </p>
      </div>
    );
  }

  const prompt = current.card[promptSide];
  const total = cards.length;
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
    <div className="max-w-screen-md mx-auto px-4 md:px-8 py-6 md:py-8 w-full flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Session Header — title + progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-low text-xs text-primary">
              {currentTypeIcon}
            </span>
            <h1 className="text-xs font-bold uppercase tracking-[0.15em] text-primary truncate">
              {lessonTitle}
            </h1>
            {reviewLabel && (
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
                &middot; {reviewLabel}
              </span>
            )}
          </div>
          <span className="text-xs font-bold text-success tracking-wider whitespace-nowrap ml-3">
            {answered}/{total}
          </span>
        </div>
        {/* Full-width progress bar */}
        <div className="h-2 w-full rounded-full overflow-hidden bg-secondary-container">
          <div
            className="h-full bg-success transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card — full width */}
      <div
        className={`relative rounded-[2rem] bg-surface-lowest p-8 md:p-12 lg:p-16 shadow-[0_4px_24px_rgba(0,14,33,0.04)] flex flex-col items-center justify-center transition-all duration-300 ${revealed ? "min-h-[360px]" : "min-h-[300px]"}`}
        onClick={() => {
          if (mode === "flashcard" && !revealed) setRevealed(true);
        }}
      >
        {/* Context button — top right */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setContextOpen(true);
          }}
          className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl bg-surface-low text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors"
          title="View context & hints"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <div
          className="font-japanese text-center leading-tight text-foreground transition-all"
        >
          <span className={prompt.length > 6 ? "text-4xl md:text-6xl lg:text-7xl" : "text-6xl md:text-8xl lg:text-[120px]"}>
            {prompt}
          </span>
        </div>

        {current.card.hint && (
          <p className="mt-6 text-sm italic text-on-surface-variant font-medium">
            {current.card.hint}
          </p>
        )}

        {mode === "flashcard" && revealed && (
          <div className="animate-in fade-in slide-in-from-bottom-4 mt-6 w-full flex flex-col items-center">
            <div className="w-20 h-[2px] bg-outline-variant/30 my-5" />
            <p
              className="font-japanese text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-center"
            >
              {current.card[answerSide]}
            </p>
          </div>
        )}
      </div>

      {/* Controls below the card */}
      <div className="mt-6 flex-1 flex flex-col">
        {mode === "flashcard" && (
          <div className="w-full">
            {!revealed ? (
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="w-full btn-primary-gradient py-5 rounded-2xl text-white font-bold text-lg shadow-[0_8px_20px_rgba(0,36,70,0.12)] transition hover:opacity-90 hover:shadow-lg"
              >
                Reveal Answer
              </button>
            ) : (
              <div className="flex justify-between gap-3 w-full">
                {ratingButtons.map((btn) => (
                  <button
                    key={btn.rating}
                    type="button"
                    onClick={() => doSRSReview(btn.rating)}
                    className={`flex-1 flex flex-col items-center py-4 rounded-2xl transition shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-1 ${btn.color}`}
                  >
                    <span className="text-[10px] font-bold opacity-70 mb-1">
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
              <div className="flex flex-col gap-3 w-full">
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
                      className={`font-japanese group relative flex items-center w-full min-h-[60px] rounded-2xl px-5 text-lg font-semibold transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.04)] ${stateClass}`}
                    >
                      {!choiceLocked && (
                        <span className="text-sm text-on-surface-variant opacity-40 font-display mr-4 w-5 shrink-0">
                          {i + 1}
                        </span>
                      )}
                      <span className="flex-1 text-left">{option}</span>
                    </button>
                  );
                })}

                {choiceLocked && (
                  <button
                    type="button"
                    onClick={submitMultipleChoice}
                    className="mt-2 w-full btn-primary-gradient py-5 rounded-2xl text-white font-bold text-lg shadow-[0_8px_20px_rgba(0,36,70,0.12)] transition hover:opacity-90 hover:shadow-lg animate-in slide-in-from-bottom-2"
                  >
                    Continue
                  </button>
                )}
              </div>
            ) : (
              <div className="w-full animate-in fade-in slide-in-from-bottom-4 bg-surface-lowest p-6 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                <p className="text-center text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-5">
                  How difficult was this?
                </p>
                <div className="flex justify-center gap-3">
                  {ratingButtons
                    .filter((b) => b.rating >= 2)
                    .map((btn) => (
                      <button
                        key={btn.rating}
                        type="button"
                        onClick={() => doSRSReview(btn.rating)}
                        className={`flex-1 flex flex-col items-center py-4 rounded-xl transition shadow-sm hover:-translate-y-1 ${btn.color}`}
                      >
                        <span className="text-[10px] font-bold opacity-70 mb-1">
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

      {/* Context Modal */}
      <ContextModal
        open={contextOpen}
        onClose={() => setContextOpen(false)}
        card={current.card}
        relatedCards={relatedCards}
        prompt={prompt}
      />
    </div>
  );
}
