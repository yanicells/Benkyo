"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  answerCorrect,
  answerWrong,
  buildQueue,
  buildQueueOrdered,
  isSessionComplete,
} from "@/lib/session";
import { TypingPracticeInput } from "@/components/session/typing-practice-input";
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
  shuffle: boolean;
  mode: "mc" | "typing";
  typingDifficulty: "easy" | "hard";
};

type TypingAttemptSummary = {
  kana: string;
  correct: string;
  typed: string;
  wasCorrect: boolean;
};

type KanaContextModalProps = {
  open: boolean;
  onClose: () => void;
  mode: "mc" | "typing";
  prompt: string;
  typingDifficulty: "easy" | "hard";
  activeCards: SessionCard[];
  mcAnswer: string;
  showMcAnswer: boolean;
};

function normalizeTyping(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "").trim();
}

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function processBatch(
  queue: SessionCard[],
  count: number,
  handler: (items: SessionCard[]) => SessionCard[],
): SessionCard[] {
  let next = queue;
  for (let i = 0; i < count; i += 1) {
    if (next.length === 0) break;
    next = handler(next);
  }
  return next;
}

function KanaContextModal({
  open,
  onClose,
  mode,
  prompt,
  typingDifficulty,
  activeCards,
  mcAnswer,
  showMcAnswer,
}: KanaContextModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface-lowest rounded-2xl shadow-[0_24px_64px_rgba(0,14,33,0.2)] overflow-hidden max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10 shrink-0">
          <h3 className="font-display text-lg font-bold text-foreground">
            {mode === "typing" ? "Answer Key & Tips" : "Study Context"}
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

        <div className="p-6 overflow-y-auto space-y-4">
          {mode === "typing" ? (
            <>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-3">
                  Answer Key
                </p>
                <div className="flex flex-wrap gap-3">
                  {activeCards.map((item, i) => (
                    <div
                      key={`${item.card.front}-${i}`}
                      className="flex-1 min-w-20 rounded-3xl bg-surface-lowest p-5 flex flex-col items-center shadow-sm border border-primary/10"
                    >
                      <span className="font-display text-4xl text-foreground mb-2">
                        {item.card.front}
                      </span>
                      <span className="text-base font-bold text-primary">
                        {item.card.romaji ?? item.card.back}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

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
                      Typing Tip
                    </span>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {typingDifficulty === "easy"
                      ? "Easy mode highlights mistyped prefixes with a red border while you type."
                      : "Hard mode hides live correctness feedback. Submit first, then review the comparison."}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-2xl border border-outline-variant/20 bg-surface-low p-5">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-2">
                  Answer Key
                </p>
                {showMcAnswer ? (
                  <p className="text-xl font-bold text-primary">{mcAnswer}</p>
                ) : (
                  <p className="text-sm text-on-surface-variant">
                    Select an option first to reveal the correct romaji.
                  </p>
                )}
              </div>

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
                      Reading Tip
                    </span>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed">
                    Focus on stroke balance and small shape differences between
                    similar kana before locking your answer.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function KanaSessionClient({
  script,
  groups: _groups,
  cards,
  batchSize,
  shuffle,
  mode,
  typingDifficulty,
}: KanaSessionClientProps) {
  const [queue, setQueue] = useState<SessionCard[]>(() =>
    shuffle ? buildQueue(cards) : buildQueueOrdered(cards),
  );

  // MC state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [choiceLocked, setChoiceLocked] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);

  // Typing state
  const [lastTypingAttempt, setLastTypingAttempt] =
    useState<TypingAttemptSummary | null>(null);

  const current = queue[0];
  const complete = isSessionComplete(queue);

  // MC: generate 4 options for the current card
  const multipleChoice = useMemo(() => {
    if (mode !== "mc" || !current) return null;
    const correct = current.card.romaji ?? current.card.back;
    const distractorPool = Array.from(
      new Set(cards.map((c) => c.romaji ?? c.back)),
    ).filter((v) => v !== correct);
    const distractors = shuffleArray(distractorPool).slice(0, 3);
    const options = shuffleArray([correct, ...distractors]);
    return { options, correct };
  }, [mode, current, cards]);

  // Typing: the active batch of cards
  const activeCards = useMemo(
    () => (mode === "typing" ? queue.slice(0, batchSize) : []),
    [mode, queue, batchSize],
  );
  const expectedSegments = useMemo(
    () => activeCards.map((c) => c.card.romaji ?? c.card.back),
    [activeCards],
  );
  const expected = useMemo(
    () => expectedSegments.join(""),
    [expectedSegments],
  );
  const expectedDisplay = useMemo(
    () => expectedSegments.join(" + "),
    [expectedSegments],
  );
  const kanaDisplay = useMemo(
    () => activeCards.map((c) => c.card.front).join(" "),
    [activeCards],
  );

  // MC: submit after selection
  const submitChoice = useCallback(() => {
    if (!multipleChoice || !choiceLocked) return;
    const wasCorrect = selectedOption === multipleChoice.correct;
    setQueue((prev) => (wasCorrect ? answerCorrect(prev) : answerWrong(prev)));
    setSelectedOption(null);
    setChoiceLocked(false);
  }, [multipleChoice, choiceLocked, selectedOption]);

  // Keyboard handlers
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (complete) return;

      // Typing: Tab toggles answer key
      if (mode === "typing" && event.key === "Tab") {
        event.preventDefault();
        setContextOpen((prev) => !prev);
        return;
      }

      // MC: number keys + Enter
      if (mode === "mc" && multipleChoice) {
        if (event.key === "Enter" && choiceLocked) {
          event.preventDefault();
          submitChoice();
          return;
        }
        const idx = Number.parseInt(event.key, 10) - 1;
        if (!Number.isNaN(idx) && idx >= 0 && idx <= 3 && !choiceLocked) {
          const option = multipleChoice.options[idx];
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
  }, [complete, mode, multipleChoice, choiceLocked, submitChoice]);

  // --- Completion screen ---
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

  const total = cards.length;
  const answered = total - Math.min(queue.length, total);
  const progressPercent = Math.max(
    0,
    Math.min(100, Math.round((answered / total) * 100)),
  );
  const prompt = current.card.front;
  const typingPrompt = useMemo(
    () => activeCards.map((item) => item.card.front).join(" "),
    [activeCards],
  );

  const progressHeader = (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-low text-xs text-primary">
            {script === "hiragana" ? "あ" : "ア"}
          </span>
          <h1 className="text-xs font-bold uppercase tracking-[0.15em] text-primary truncate">
            Kana Session
          </h1>
        </div>
        <span className="text-xs font-bold text-success tracking-wider whitespace-nowrap ml-3">
          {answered}/{total}
        </span>
      </div>
      <div className="h-2 w-full rounded-full overflow-hidden bg-secondary-container">
        <div
          className="h-full bg-success transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );

  // ============================================================
  // MULTIPLE CHOICE MODE
  // ============================================================
  if (mode === "mc") {
    return (
      <div className="max-w-screen-md mx-auto px-4 md:px-8 py-6 md:py-8 w-full flex flex-col min-h-[calc(100vh-4rem)]">
        <div className="sticky top-14 lg:top-16 z-20 -mx-4 md:-mx-8 mb-5 border-b border-outline-variant/10 bg-surface/95 px-4 py-3 backdrop-blur-md md:px-8">
          <Link
            href="/kana"
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
            Back to Kana
          </Link>
        </div>

          {progressHeader}

        <div className="relative rounded-[2rem] bg-surface-lowest p-6 md:p-8 lg:p-10 shadow-[0_4px_24px_rgba(0,14,33,0.04)] flex flex-col items-center justify-center min-h-[250px]">
          <button
            type="button"
            onClick={() => setContextOpen(true)}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl bg-surface-low text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors"
            title="View context"
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

            <div className="font-japanese text-center leading-tight text-foreground transition-all">
              <span
                className={
                  prompt.length > 6
                    ? "text-[1.6rem] md:text-[2.4rem] lg:text-[3rem]"
                    : "text-[2.2rem] md:text-[3.3rem] lg:text-[4.2rem]"
                }
              >
                {prompt}
              </span>
          </div>
        </div>

        {multipleChoice && (
          <div className="mt-6 w-full flex flex-col gap-3">
            {multipleChoice.options.map((option) => {
              const isSelected = selectedOption === option;
              const isCorrect = multipleChoice.correct === option;

              let stateClass =
                "bg-surface-lowest text-foreground border-2 border-outline-variant/25 hover:border-primary/55";
              if (choiceLocked) {
                if (isCorrect) {
                  stateClass = "bg-success border-success text-white shadow-lg";
                } else if (isSelected) {
                  stateClass = "bg-error border-error text-white shadow-lg";
                }
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
                  className={`font-japanese group relative flex items-center w-full min-h-17 rounded-2xl px-4 py-3.5 md:px-5 md:py-4 text-lg md:text-xl font-normal transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.04)] ${stateClass}`}
                >
                  <span className="flex-1 text-center leading-relaxed wrap-break-word">
                    {option}
                  </span>
                </button>
              );
            })}

            {choiceLocked && (
              <button
                type="button"
                onClick={submitChoice}
                className="mt-2 w-full btn-primary-gradient py-5 rounded-2xl text-white font-bold text-lg shadow-[0_8px_20px_rgba(0,36,70,0.12)] transition hover:opacity-90 hover:shadow-lg animate-in slide-in-from-bottom-2"
              >
                Continue
              </button>
            )}
          </div>
        )}

        <KanaContextModal
          open={contextOpen}
          onClose={() => setContextOpen(false)}
          mode="mc"
          prompt={prompt}
          typingDifficulty={typingDifficulty}
          activeCards={[]}
          mcAnswer={multipleChoice?.correct ?? ""}
          showMcAnswer={choiceLocked}
        />
      </div>
    );
  }

  // ============================================================
  // TYPING MODE
  // ============================================================
  return (
    <div className="max-w-screen-md mx-auto px-4 md:px-8 py-6 md:py-8 w-full flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="sticky top-14 lg:top-16 z-20 -mx-4 md:-mx-8 mb-5 border-b border-outline-variant/10 bg-surface/95 px-4 py-3 backdrop-blur-md md:px-8">
        <Link
          href="/kana"
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
          Back to Kana
        </Link>
      </div>

        {progressHeader}

      <div className="relative rounded-[2rem] bg-surface-lowest p-6 md:p-8 lg:p-10 shadow-[0_4px_24px_rgba(0,14,33,0.04)] flex flex-col items-center justify-center min-h-[280px]">
        <button
          type="button"
          onClick={() => setContextOpen(true)}
          className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl bg-surface-low text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors"
          title="View answer key and tips"
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

          <div className="font-japanese text-center leading-tight text-foreground transition-all">
            <span
              className={
                typingPrompt.length > 6
                  ? "text-[1.6rem] md:text-[2.4rem] lg:text-[3rem]"
                  : "text-[2.2rem] md:text-[3.3rem] lg:text-[4.2rem]"
              }
            >
              {typingPrompt}
            </span>
        </div>
        {activeCards.length > 1 && (
          <p className="absolute bottom-5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50">
            Type all {activeCards.length} kana together
          </p>
        )}
      </div>

      <div className="mt-6 rounded-[2rem] bg-surface-lowest p-6 lg:p-8 shadow-[0_4px_24px_rgba(0,14,33,0.04)]">
        <TypingPracticeInput
          key={activeCards.map((c, i) => `${c.card.front}-${i}`).join("|")}
          expected={expected}
          placeholder="type romaji..."
          showExpected={false}
          manualAdvance
          manualAdvanceValidation="non-empty"
          liveFeedback={typingDifficulty}
          controlsAlign="between"
          onSubmit={({ typed }) => {
            const wasCorrect = normalizeTyping(typed) === normalizeTyping(expected);
            setLastTypingAttempt({
              kana: kanaDisplay,
              correct: expectedDisplay,
              typed: typed || "(blank)",
              wasCorrect,
            });
            setQueue((prev) =>
              processBatch(
                prev,
                activeCards.length,
                wasCorrect ? answerCorrect : answerWrong,
              ),
            );
          }}
          onGiveUp={() => {
            setLastTypingAttempt({
              kana: kanaDisplay,
              correct: expectedDisplay,
              typed: "(skipped)",
              wasCorrect: false,
            });
            setQueue((prev) => processBatch(prev, activeCards.length, answerWrong));
          }}
          giveUpLabel="Skip"
          nextLabel="Next →"
        />

        {lastTypingAttempt && (
          <div
            className={`mt-4 rounded-xl border px-4 py-3 ${
              lastTypingAttempt.wasCorrect
                ? "border-success/30 bg-success/10"
                : "border-error/25 bg-error/10"
            }`}
          >
            {lastTypingAttempt.wasCorrect ? (
              <p className="text-sm font-semibold text-success">
                Correct. Nice read.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-error">
                  Not quite. Here&apos;s a quick comparison.
                </p>
                <div className="rounded-lg border border-error/20 bg-surface-lowest/80 px-3 py-2">
                  <div className="grid grid-cols-[132px_1fr] items-center gap-x-3 gap-y-1.5 text-sm">
                    <span className="font-semibold text-on-surface-variant">
                      Kana
                    </span>
                    <span className="font-japanese-display text-base text-foreground">
                      {lastTypingAttempt.kana}
                    </span>
                    <span className="font-semibold text-on-surface-variant">
                      Correct
                    </span>
                    <span className="font-semibold text-foreground">
                      {lastTypingAttempt.correct}
                    </span>
                    <span className="font-semibold text-on-surface-variant">
                      Your answer
                    </span>
                    <span className="font-semibold text-error break-words">
                      {lastTypingAttempt.typed}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <KanaContextModal
        open={contextOpen}
        onClose={() => setContextOpen(false)}
        mode="typing"
        prompt={prompt}
        typingDifficulty={typingDifficulty}
        activeCards={activeCards}
        mcAnswer=""
        showMcAnswer={false}
      />
    </div>
  );
}
