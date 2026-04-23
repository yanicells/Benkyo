"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  answerCorrect,
  answerWrong,
  buildQueue,
  buildQueueOrdered,
} from "@/lib/session";
import {
  reviewCard,
  makeCardId,
  getAllSRS,
  recordDailyReview,
  updateStreak,
} from "@/lib/srs";
import type {
  Card,
  CardFilter,
  CardType,
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
  cardSubDeckIds: string[];
  cardIndexes: number[];
  allLessonCards: Card[];
  isReview?: boolean;
  reviewLabels?: string[];
  cardFilter?: CardFilter;
  basePath?: "/decks" | "/reviewer";
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

function isKanjiBack(back: string): boolean {
  return /^(Meaning|Reading):\s/.test(back.trim());
}

// For multiple-choice, strip lines that would reveal the kanji being asked
// (Example shows the kanji inside the compound; Breakdown spells out the parts).
function stripKanjiMCSpoilers(back: string): string {
  if (!isKanjiBack(back)) return back;
  return back
    .split("\n")
    .filter((line) => !/^(Example|Breakdown):/.test(line.trim()))
    .join("\n");
}

function KanjiBack({ back }: { back: string }) {
  const rows = back
    .split(/\n+/)
    .map((line) => {
      const m = line.match(/^([^:]+):\s*(.*)$/);
      return m ? { label: m[1].trim(), value: m[2].trim() } : null;
    })
    .filter((r): r is { label: string; value: string } => r !== null);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-1.5 text-center leading-relaxed">
      {rows.map((r, i) => (
        <p key={i} className="font-japanese text-lg md:text-xl lg:text-2xl text-foreground wrap-break-word">
          <span className="font-semibold text-primary">{r.label}:</span>{" "}
          {r.value}
        </p>
      ))}
    </div>
  );
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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex max-h-[75vh] sm:max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-surface-lowest shadow-[0_24px_64px_rgba(0,14,33,0.2)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10 shrink-0">
          <h3 className="font-display text-lg font-bold text-foreground">
            Card Context
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-low transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-4">
          {/* Hint / Study tip */}
          <div className="bg-[#001736] rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute -right-4 -bottom-8 font-display text-[120px] font-bold text-white/5 pointer-events-none select-none leading-none">
              {prompt}
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className="w-4 h-4 text-[#8ef4e4]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
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

function applyCardFilter(
  cards: Card[],
  cardSubDeckIds: string[],
  cardIndexes: number[],
  filter: CardFilter,
) {
  if (filter === "all") return { cards, cardSubDeckIds, cardIndexes };
  const allSRS = getAllSRS();
  const keep: number[] = [];
  for (let i = 0; i < cards.length; i++) {
    const srs = allSRS[makeCardId(cardSubDeckIds[i], cardIndexes[i])];
    const isNew = !srs || srs.totalReviews === 0;
    const isMastered = srs != null && srs.interval >= 21;
    if (
      (filter === "new" && isNew) ||
      (filter === "learning" && !isNew && !isMastered) ||
      (filter === "mastered" && isMastered)
    ) {
      keep.push(i);
    }
  }
  if (keep.length === 0) return { cards, cardSubDeckIds, cardIndexes };
  return {
    cards: keep.map((i) => cards[i]),
    cardSubDeckIds: keep.map((i) => cardSubDeckIds[i]),
    cardIndexes: keep.map((i) => cardIndexes[i]),
  };
}

export function DeckSessionClient({
  lessonId,
  subDeckId,
  lessonTitle,
  cards: rawCards,
  mode,
  cardSubDeckIds: rawSubDeckIds,
  cardIndexes: rawCardIndexes,
  allLessonCards,
  isReview = false,
  reviewLabels,
  cardFilter = "all",
  basePath = "/decks",
}: DeckSessionClientProps) {
  const router = useRouter();
  const filtered = useMemo(
    () => applyCardFilter(rawCards, rawSubDeckIds, rawCardIndexes, cardFilter),
    [rawCards, rawSubDeckIds, rawCardIndexes, cardFilter],
  );
  const cards = filtered.cards;
  const cardSubDeckIds = filtered.cardSubDeckIds;
  const cardIndexes = filtered.cardIndexes;
  const [queue, setQueue] = useState<SessionCard[]>(() => {
    const f = applyCardFilter(rawCards, rawSubDeckIds, rawCardIndexes, cardFilter);
    const isKanjiCharDeck =
      f.cards.length > 0 && f.cards.every((c) => isKanjiBack(c.back));
    if (!isKanjiCharDeck) return buildQueue(f.cards);

    const srs = getAllSRS();
    const learning: Card[] = [];
    const mastered: Card[] = [];
    f.cards.forEach((card, i) => {
      const id = makeCardId(f.cardSubDeckIds[i], f.cardIndexes[i]);
      const s = srs[id];
      if (s && s.interval >= 21) mastered.push(card);
      else learning.push(card);
    });
    // Keep new/learning cards in JSON order; shuffle only mastered ones.
    return [...buildQueueOrdered(learning), ...buildQueue(mastered)];
  });
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
      router.replace(`${basePath}/${lessonId}/${subDeckId}/session/results`);
    }
  }, [queue, cards, wrongKeys, lessonId, subDeckId, router, isReview, basePath]);

  const multipleChoice = useMemo(() => {
    if (!current || mode !== "multiple-choice") return null;

    const isFillIn = current.card.type === "fill-in";
    const correct = stripKanjiMCSpoilers(current.card.back);

    let distractorPool: string[];

    if (isFillIn) {
      distractorPool = allLessonCards
        .filter(
          (c) => c.type === "fill-in" && cardKey(c) !== cardKey(current.card),
        )
        .map((c) => stripKanjiMCSpoilers(c.back))
        .filter((v) => v !== correct);
    } else {
      distractorPool = allLessonCards
        .filter((card) => cardKey(card) !== cardKey(current.card))
        .map((card) => stripKanjiMCSpoilers(card.back))
        .filter((value) => value !== correct);
    }

    const distractors = shuffle(distractorPool).slice(0, 3);
    const options = shuffle(Array.from(new Set([correct, ...distractors])));

    return { options, correct };
  }, [current, mode, allLessonCards]);

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

  const prompt = current.card.front;
  const promptLength = prompt.trim().length;
  const promptTypographyClass =
    promptLength > 22
      ? "text-[1.25rem] md:text-[1.8rem] lg:text-[2.2rem]"
      : promptLength > 12
        ? "text-[1.45rem] md:text-[2.1rem] lg:text-[2.6rem]"
        : promptLength > 6
          ? "text-[1.7rem] md:text-[2.4rem] lg:text-[3rem]"
          : "text-[2.2rem] md:text-[3.3rem] lg:text-[4.2rem]";
  const unrevealedCardSizeClass =
    promptLength > 16
      ? "min-h-[180px] md:min-h-[220px]"
      : "min-h-[150px] md:min-h-[190px]";
  const revealedCardSizeClass =
    promptLength > 16
      ? "min-h-[230px] md:min-h-[280px]"
      : "min-h-[200px] md:min-h-[250px]";
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
    <div className="max-w-screen-md mx-auto px-4 md:px-8 pt-0 pb-6 md:py-8 w-full flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="sticky top-0 lg:top-16 z-20 -mx-4 md:-mx-8 mb-5 border-b border-outline-variant/10 bg-surface/95 px-4 py-3 backdrop-blur-md md:px-8">
        <div className="flex items-center justify-between">
          <Link
            href={isReview ? "/review" : `${basePath}/${lessonId}/${subDeckId}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {isReview ? "Back to Review" : "Back to Deck"}
          </Link>
          <button
            type="button"
            onClick={() => setContextOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-low text-primary shadow-none transition-colors hover:bg-primary/10"
            title="View context & hints"
            aria-label="View context and hints"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
      </div>

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
        className={`relative rounded-[2rem] border border-primary/35 bg-surface-lowest px-6 py-5 md:px-8 md:py-7 lg:px-10 lg:py-8 shadow-[0_4px_24px_rgba(0,14,33,0.04)] flex flex-col items-center justify-center transition-all duration-300 ${revealed ? revealedCardSizeClass : unrevealedCardSizeClass}`}
        onClick={() => {
          if (mode === "flashcard" && !revealed) setRevealed(true);
        }}
      >
        <div
          className="font-sans text-center leading-tight text-foreground transition-all whitespace-pre-line"
        >
          <span className={promptTypographyClass}>{prompt}</span>
        </div>

        {current.card.hint && (
          <p className="mt-4 text-sm italic text-on-surface-variant font-medium">
            {current.card.hint}
          </p>
        )}

        {mode === "flashcard" && revealed && (
          <div className="animate-in fade-in slide-in-from-bottom-4 mt-4 w-full flex flex-col items-center">
            <div className="w-16 h-[2px] bg-outline-variant/30 my-4" />
            {isKanjiBack(current.card.back) ? (
              <KanjiBack back={current.card.back} />
            ) : (
              <p className="font-japanese text-2xl md:text-3xl lg:text-4xl font-bold text-foreground text-center whitespace-pre-line">
                {current.card.back}
              </p>
            )}
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
                {multipleChoice.options.map((option) => {
                  const isSelected = selectedOption === option;
                  const isCorrect = multipleChoice.correct === option;
                  const optionFontClass = "font-sans";

                  let stateClass =
                    "bg-surface-lowest text-foreground border-2 border-outline-variant/25 hover:border-primary/55";
                  if (choiceLocked) {
                    if (isCorrect)
                      stateClass =
                        "bg-success border-success text-white shadow-lg";
                    else if (isSelected)
                      stateClass = "bg-error border-error text-white shadow-lg";
                  }

                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={choiceLocked}
                      onClick={() => {
                        if (choiceLocked) return;
                        setSelectedOption(option);
                        setChoiceLocked(true);
                      }}
                      className={`${optionFontClass} group relative flex items-center w-full min-h-17 rounded-2xl px-4 py-3.5 md:px-5 md:py-4 text-lg md:text-xl font-medium transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.04)] ${stateClass}`}
                    >
                      <span className="flex-1 text-center leading-relaxed wrap-break-word whitespace-pre-line">
                        {option}
                      </span>
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
