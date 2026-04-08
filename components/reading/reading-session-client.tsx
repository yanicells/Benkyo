"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ReadingStory } from "@/lib/types";
import { saveStoryResult } from "@/lib/reading-progress";

type Props = {
  story: ReadingStory;
};

type Phase = "read" | "questions" | "results";

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
      parts.push({
        text: matchedHighlight.word,
        reading: matchedHighlight.reading,
      });
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
  const [passageIdx, setPassageIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("read");
  const [showTranslation, setShowTranslation] = useState(false);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showVocab, setShowVocab] = useState(false);

  const totalPassages = story.passages.length;
  const totalQuestions = story.questions.length;
  const totalSteps = totalPassages + totalQuestions;

  // Progress: passages read + questions answered
  const currentStep =
    phase === "read"
      ? passageIdx
      : phase === "questions"
        ? totalPassages + questionIdx + (answered ? 1 : 0)
        : totalSteps;
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  const passage = story.passages[passageIdx];
  const question = story.questions[questionIdx];

  const handleSubmitAnswer = useCallback(() => {
    if (selectedAnswer === null || !question) return;
    setAnswered(true);
    if (selectedAnswer === question.correctIndex) {
      setScore((s) => s + 1);
    }
  }, [selectedAnswer, question]);

  const handleNext = useCallback(() => {
    if (phase === "read") {
      if (passageIdx < totalPassages - 1) {
        setPassageIdx((p) => p + 1);
        setShowTranslation(false);
        setShowVocab(false);
      } else {
        // Done reading all passages, move to questions
        setPhase("questions");
        setQuestionIdx(0);
        setSelectedAnswer(null);
        setAnswered(false);
      }
      return;
    }

    if (phase === "questions") {
      if (questionIdx < totalQuestions - 1) {
        setQuestionIdx((q) => q + 1);
        setSelectedAnswer(null);
        setAnswered(false);
      } else {
        // Done with all questions — save results and navigate
        // score was already incremented in handleSubmitAnswer
        saveStoryResult(story.id, score, totalQuestions);

        const resultsData = {
          storyTitle: story.title,
          passagesRead: totalPassages,
          score,
          totalQuestions,
        };
        sessionStorage.setItem(
          `reading-results:${story.difficulty}:${story.id}`,
          JSON.stringify(resultsData),
        );
        router.push(
          `/reading/${story.difficulty}/${story.id}/session/results`,
        );
      }
      return;
    }
  }, [
    phase,
    passageIdx,
    totalPassages,
    questionIdx,
    totalQuestions,
    score,
    story,
    router,
  ]);

  return (
    <div className="min-h-dvh bg-surface flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-surface/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              router.push(`/reading/${story.difficulty}/${story.id}`)
            }
            className="text-on-surface-variant hover:text-foreground transition-colors p-1"
            aria-label="Back to story"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-secondary">
              {story.title} &middot;{" "}
              {phase === "read"
                ? `Passage ${passageIdx + 1}/${totalPassages}`
                : `Question ${questionIdx + 1}/${totalQuestions}`}
            </p>
          </div>
        </div>
        <div className="h-[2px] bg-outline-variant/20">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 md:py-10">
        {phase === "read" && passage && (
          <div className="flex flex-col gap-6">
            {/* Passage Card */}
            <div className="rounded-[2rem] border border-primary/35 bg-surface-lowest px-6 py-5 md:px-8 md:py-7 shadow-[0_12px_40px_rgba(0,14,33,0.06)]">
              <p className="font-japanese-display text-xl md:text-2xl lg:text-[1.75rem] leading-relaxed md:leading-loose text-foreground tracking-wide text-center">
                <FuriganaText
                  text={passage.passage}
                  highlights={passage.vocabularyHighlights}
                />
              </p>
            </div>

            {/* Translation reveal */}
            {!showTranslation ? (
              <button
                type="button"
                onClick={() => setShowTranslation(true)}
                className="self-start text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5"
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
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                Show Translation
              </button>
            ) : (
              <div className="bg-primary/5 rounded-xl p-4 md:p-5 border border-primary/10">
                <p className="text-sm md:text-base text-foreground leading-relaxed">
                  {passage.translation}
                </p>
              </div>
            )}

            {/* Vocabulary highlights */}
            <div>
              <button
                type="button"
                onClick={() => setShowVocab(!showVocab)}
                className="text-sm font-semibold text-secondary hover:text-foreground transition-colors flex items-center gap-1.5 mb-3"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${showVocab ? "rotate-90" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                Key Vocabulary ({passage.vocabularyHighlights.length})
              </button>
              {showVocab && (
                <div className="flex flex-wrap gap-2">
                  {passage.vocabularyHighlights.map((v, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 bg-surface-low rounded-lg px-3 py-1.5 text-sm"
                    >
                      <span className="font-japanese font-medium text-foreground">
                        {v.word}
                      </span>
                      {v.reading && (
                        <span className="text-secondary text-xs">
                          ({v.reading})
                        </span>
                      )}
                      <span className="text-secondary">&mdash;</span>
                      <span className="text-on-surface-variant">
                        {v.meaning}
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Continue button */}
            <button
              type="button"
              onClick={handleNext}
              className="mt-2 w-full btn-primary-gradient text-white font-bold py-3 px-8 rounded-xl shadow-[0_8px_24px_rgba(0,36,70,0.12)] hover:opacity-90 transition"
            >
              {passageIdx < totalPassages - 1
                ? "Next Passage"
                : "Continue to Questions"}
            </button>
          </div>
        )}

        {phase === "questions" && question && (
          <div className="flex flex-col gap-6">
            {/* Passage reminder (collapsed) */}
            <div className="bg-surface-lowest rounded-xl p-4 border border-outline-variant/10">
              <p className="font-japanese text-sm md:text-base text-secondary leading-relaxed line-clamp-2">
                {story.passages.map((p) => p.passage).join(" ")}
              </p>
            </div>

            {/* Question */}
            <div className="rounded-[2rem] border border-primary/35 bg-surface-lowest px-6 py-5 md:px-8 md:py-7 shadow-[0_12px_40px_rgba(0,14,33,0.06)]">
              <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">
                Question {questionIdx + 1} of {totalQuestions}
              </p>
              <h3 className="font-display text-lg md:text-xl font-bold text-foreground mb-6">
                {question.question}
              </h3>

              <div className="flex flex-col gap-3">
                {question.options.map((option, i) => {
                  let optionStyle =
                    "border-2 border-outline-variant/25 bg-surface-lowest hover:border-primary/55";
                  if (answered) {
                    if (i === question.correctIndex) {
                      optionStyle =
                        "border-2 border-success bg-success/10 text-foreground";
                    } else if (i === selectedAnswer) {
                      optionStyle =
                        "border-2 border-error bg-error/10 text-foreground";
                    } else {
                      optionStyle =
                        "border-2 border-outline-variant/20 opacity-50";
                    }
                  } else if (i === selectedAnswer) {
                    optionStyle =
                      "border-2 border-primary bg-primary/10";
                  }

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (!answered) setSelectedAnswer(i);
                      }}
                      disabled={answered}
                      className={`w-full text-center min-h-17 rounded-2xl px-4 py-3.5 md:px-5 md:py-4 transition-all ${optionStyle}`}
                    >
                      <span className="text-base md:text-lg font-medium">
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Submit / Next */}
              <div className="mt-6 flex justify-center">
                {!answered ? (
                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    className="btn-primary-gradient text-white font-bold py-3 px-8 rounded-xl shadow-[0_8px_24px_rgba(0,36,70,0.12)] hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-primary-gradient text-white font-bold py-3 px-8 rounded-xl shadow-[0_8px_24px_rgba(0,36,70,0.12)] hover:opacity-90 transition"
                  >
                    {questionIdx < totalQuestions - 1
                      ? "Next Question"
                      : "See Results"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
