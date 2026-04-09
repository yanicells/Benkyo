"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { ReadingStory } from "@/lib/types";
import { saveStoryResult } from "@/lib/reading-progress";

type Props = {
  story: ReadingStory;
};

type Phase = "read" | "questions";

function FuriganaText({
  text,
  highlights,
}: {
  text: string;
  highlights: ReadingStory["passages"][number]["vocabularyHighlights"];
}) {
  const kanjiWithReading = highlights.filter((h) => h.reading);
  if (kanjiWithReading.length === 0) {
    return <span>{text}</span>;
  }

  const parts: { text: string; reading?: string }[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    let earliestIdx = remaining.length;
    let matchedHighlight: (typeof kanjiWithReading)[number] | null = null;

    for (const h of kanjiWithReading) {
      const idx = remaining.indexOf(h.word);
      if (idx !== -1 && idx < earliestIdx) {
        earliestIdx = idx;
        matchedHighlight = h;
      }
    }

    if (matchedHighlight && earliestIdx < remaining.length) {
      if (earliestIdx > 0) {
        parts.push({ text: remaining.slice(0, earliestIdx) });
      }
      parts.push({ text: matchedHighlight.word, reading: matchedHighlight.reading });
      remaining = remaining.slice(earliestIdx + matchedHighlight.word.length);
    } else {
      parts.push({ text: remaining });
      remaining = "";
    }
  }

  return (
    <>
      {parts.map((part, i) =>
        part.reading ? (
          <ruby key={i}>
            {part.text}
            <rp>(</rp>
            <rt className="text-xs text-secondary">{part.reading}</rt>
            <rp>)</rp>
          </ruby>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  );
}

export function ReadingSessionClient({ story }: Props) {
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("read");
  const [passageIdx, setPassageIdx] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showVocab, setShowVocab] = useState(false);

  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const totalPassages = story.passages.length;
  const totalQuestions = story.questions.length;
  const totalSteps = totalPassages + totalQuestions;

  const currentStep =
    phase === "read"
      ? passageIdx
      : totalPassages + questionIdx;
  const progressPercent =
    totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;

  const passage = story.passages[passageIdx];
  const question = story.questions[questionIdx];

  const handleNext = useCallback(() => {
    if (phase === "read") {
      if (passageIdx < totalPassages - 1) {
        setPassageIdx((p) => p + 1);
        setShowTranslation(false);
        setShowVocab(false);
      } else {
        if (totalQuestions === 0) {
          saveStoryResult(story.id, 0, 0);
          const resultsData = {
            storyTitle: story.title,
            passagesRead: totalPassages,
            score: 0,
            totalQuestions: 0,
          };
          sessionStorage.setItem(
            `reading-results:${story.difficulty}:${story.id}`,
            JSON.stringify(resultsData),
          );
          router.push(`/reading/${story.difficulty}/${story.id}/session/results`);
          return;
        }
        setPhase("questions");
        setQuestionIdx(0);
        setSelectedAnswer(null);
        setAnswered(false);
      }
      return;
    }

    if (!question || !answered) return;

    const isCorrect = selectedAnswer === question.correctIndex;
    const nextScore = score + (isCorrect ? 1 : 0);

    if (questionIdx < totalQuestions - 1) {
      setScore(nextScore);
      setQuestionIdx((q) => q + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      return;
    }

    saveStoryResult(story.id, nextScore, totalQuestions);
    const resultsData = {
      storyTitle: story.title,
      passagesRead: totalPassages,
      score: nextScore,
      totalQuestions,
    };
    sessionStorage.setItem(
      `reading-results:${story.difficulty}:${story.id}`,
      JSON.stringify(resultsData),
    );
    router.push(`/reading/${story.difficulty}/${story.id}/session/results`);
  }, [
    phase,
    passageIdx,
    totalPassages,
    question,
    answered,
    selectedAnswer,
    score,
    questionIdx,
    totalQuestions,
    story,
    router,
  ]);

  const questionOptions = useMemo(() => {
    if (phase !== "questions" || !question) return [];
    return question.options.map((option, idx) => ({ option, idx }));
  }, [phase, question]);

  return (
    <div className="max-w-3xl mx-auto w-full flex min-h-[calc(100vh-4rem)] flex-col px-4 pt-0 pb-6 md:px-8 md:py-8">
      <div className="sticky top-0 lg:top-16 z-20 -mx-4 md:-mx-8 mb-5 border-b border-outline-variant/10 bg-surface/95 px-4 py-3 backdrop-blur-md md:px-8">
        <div className="flex items-center justify-between">
          <Link
            href={`/reading/${story.difficulty}/${story.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Story
          </Link>
          {phase === "read" && passage && (
            <button
              type="button"
              onClick={() => setShowVocab((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-surface-low px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
              title="Vocabulary help"
              aria-label="Toggle vocabulary help"
            >
              <span>Vocab</span>
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xs font-bold uppercase tracking-[0.15em] text-primary truncate">
            {story.title}
          </h1>
          <span className="ml-3 whitespace-nowrap text-xs font-bold tracking-wider text-success">
            {phase === "read" ? `${passageIdx + 1}/${totalPassages}` : `${questionIdx + (answered ? 1 : 0)}/${totalQuestions}`}
          </span>
        </div>
        <div className="h-2 w-full rounded-full overflow-hidden bg-secondary-container">
          <div
            className="h-full rounded-full bg-success transition-all duration-300"
            style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
          />
        </div>
      </div>

      {phase === "read" && passage && (
        <>
          <div className="relative flex min-h-45 flex-col items-center justify-center rounded-4xl border border-primary/35 bg-surface-lowest px-6 py-5 shadow-[0_4px_24px_rgba(0,14,33,0.04)] md:min-h-55 md:px-8 md:py-7 lg:px-10 lg:py-8">
            <p className="font-japanese text-center text-2xl leading-relaxed text-foreground md:text-3xl lg:text-4xl">
              <FuriganaText
                text={passage.passage}
                highlights={passage.vocabularyHighlights}
              />
            </p>

            {showTranslation && (
              <div className="animate-in fade-in slide-in-from-bottom-4 mt-4 w-full flex flex-col items-center">
                <div className="my-4 h-0.5 w-16 bg-outline-variant/30" />
                <p className="text-center text-sm text-on-surface-variant md:text-base">
                  {passage.translation}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setShowTranslation((v) => !v)}
              className="rounded-2xl border-2 border-outline-variant/25 bg-surface-lowest px-4 py-3.5 text-sm font-semibold text-foreground transition-all hover:border-primary/55"
            >
              {showTranslation ? "Hide Translation" : "Show Translation"}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary-gradient rounded-2xl px-4 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(0,36,70,0.12)] transition hover:opacity-90"
            >
              {passageIdx < totalPassages - 1
                ? "Next Passage"
                : "Continue to Questions"}
            </button>
          </div>

          <div className="mt-4">
            {showVocab && (
              <div className="animate-in fade-in slide-in-from-top-1">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                  Key Vocabulary ({passage.vocabularyHighlights.length})
                </p>
                <div className="flex flex-wrap gap-2">
                {passage.vocabularyHighlights.map((v, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-surface-low px-3 py-1.5 text-sm"
                  >
                    <span className="font-japanese font-medium text-foreground">
                      {v.word}
                    </span>
                    {v.reading && (
                      <span className="text-xs text-secondary">({v.reading})</span>
                    )}
                    <span className="text-secondary">-</span>
                    <span className="text-on-surface-variant">{v.meaning}</span>
                  </span>
                ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {phase === "questions" && question && (
        <div className="flex flex-1 flex-col">
          <div className="relative flex min-h-45 flex-col items-center justify-center rounded-4xl border border-primary/35 bg-surface-lowest px-6 py-5 shadow-[0_4px_24px_rgba(0,14,33,0.04)] md:min-h-55 md:px-8 md:py-7 lg:px-10 lg:py-8">
            <div className="font-sans text-center leading-tight text-foreground transition-all">
              <span className="text-2xl font-bold md:text-3xl lg:text-4xl">
                {question.question}
              </span>
            </div>
          </div>

          <div className="mt-6 w-full">
            <div className="flex flex-col gap-3">
              {questionOptions.map(({ option, idx }) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = answered && idx === question.correctIndex;
                const isWrongSelected = answered && isSelected && !isCorrect;

                let stateClass =
                  "bg-surface-lowest text-foreground border-2 border-outline-variant/25 hover:border-primary/55";
                if (isCorrect) {
                  stateClass = "bg-success border-success text-white shadow-lg";
                } else if (isWrongSelected) {
                  stateClass = "bg-error border-error text-white shadow-lg";
                } else if (isSelected) {
                  stateClass = "bg-primary/10 border-2 border-primary";
                }

                return (
                  <button
                    key={`${option}-${idx}`}
                    type="button"
                    disabled={answered}
                    onClick={() => {
                      if (answered) return;
                      setSelectedAnswer(idx);
                      setAnswered(true);
                    }}
                    className={`relative flex min-h-17 w-full items-center rounded-2xl px-4 py-3.5 text-lg font-medium shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all duration-200 md:px-5 md:py-4 md:text-xl ${stateClass}`}
                  >
                    <span className="flex-1 text-center leading-relaxed wrap-break-word">
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full btn-primary-gradient rounded-2xl py-5 text-lg font-bold text-white shadow-[0_8px_20px_rgba(0,36,70,0.12)] transition hover:opacity-90 hover:shadow-lg animate-in slide-in-from-bottom-2"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
