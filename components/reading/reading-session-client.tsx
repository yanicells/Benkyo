"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ReadingPassage, ReadingDifficulty } from "@/lib/types";

type Props = {
  passages: ReadingPassage[];
  difficulty: ReadingDifficulty;
};

type Phase = "read" | "questions" | "results";

function FuriganaText({ text, highlights }: {
  text: string;
  highlights: ReadingPassage["vocabularyHighlights"];
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
      remaining = remaining.slice(
        earliestIdx + matchedHighlight.word.length,
      );
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

export function ReadingSessionClient({ passages, difficulty }: Props) {
  const router = useRouter();
  const [passageIdx, setPassageIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("read");
  const [showTranslation, setShowTranslation] = useState(false);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showVocab, setShowVocab] = useState(false);

  const passage = passages[passageIdx];
  const progress = ((passageIdx + (phase === "results" ? 1 : 0)) / passages.length) * 100;

  const handleSubmitAnswer = useCallback(() => {
    if (selectedAnswer === null || !passage) return;
    setAnswered(true);
    setTotalQuestions((t) => t + 1);
    if (selectedAnswer === passage.questions[questionIdx].correctIndex) {
      setScore((s) => s + 1);
    }
  }, [selectedAnswer, passage, questionIdx]);

  const handleNext = useCallback(() => {
    if (!passage) return;

    if (phase === "read") {
      setPhase("questions");
      setQuestionIdx(0);
      setSelectedAnswer(null);
      setAnswered(false);
      return;
    }

    if (phase === "questions") {
      if (questionIdx < passage.questions.length - 1) {
        setQuestionIdx((q) => q + 1);
        setSelectedAnswer(null);
        setAnswered(false);
      } else if (passageIdx < passages.length - 1) {
        setPassageIdx((p) => p + 1);
        setPhase("read");
        setShowTranslation(false);
        setQuestionIdx(0);
        setSelectedAnswer(null);
        setAnswered(false);
        setShowVocab(false);
      } else {
        setPhase("results");
      }
      return;
    }
  }, [phase, passage, questionIdx, passageIdx, passages.length]);

  const difficultyLabels: Record<ReadingDifficulty, string> = {
    simple: "Simple",
    intermediate: "Intermediate",
    hard: "Hard",
  };

  if (phase === "results") {
    const pct = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    return (
      <div className="min-h-dvh bg-surface flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-lg text-center">
            <div className="bg-surface-lowest rounded-3xl p-8 md:p-10 shadow-[0_12px_40px_rgba(0,14,33,0.06)]">
              <div className="mb-6">
                <span className="font-japanese-display text-5xl md:text-6xl text-primary/20 block mb-4" aria-hidden>
                  {"\u8AAD"}
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  Session Complete
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-surface-low rounded-2xl p-4">
                  <p className="font-display text-3xl font-extrabold text-foreground">
                    {passages.length}
                  </p>
                  <p className="text-xs text-secondary uppercase font-bold tracking-wider mt-1">
                    Passages Read
                  </p>
                </div>
                <div className="bg-surface-low rounded-2xl p-4">
                  <p className="font-display text-3xl font-extrabold text-foreground">
                    {pct}%
                  </p>
                  <p className="text-xs text-secondary uppercase font-bold tracking-wider mt-1">
                    Accuracy
                  </p>
                </div>
              </div>

              <p className="text-sm text-secondary mb-8">
                {score} of {totalQuestions} questions correct
              </p>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPassageIdx(0);
                    setPhase("read");
                    setShowTranslation(false);
                    setQuestionIdx(0);
                    setSelectedAnswer(null);
                    setAnswered(false);
                    setScore(0);
                    setTotalQuestions(0);
                    setShowVocab(false);
                  }}
                  className="btn-primary-gradient text-white font-bold py-3 px-6 rounded-xl shadow-[0_8px_24px_rgba(0,36,70,0.12)] hover:opacity-90 transition"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/reading")}
                  className="text-sm font-semibold text-primary hover:underline py-2"
                >
                  Change Difficulty
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!passage) return null;

  return (
    <div className="min-h-dvh bg-surface flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-surface/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/reading")}
            className="text-on-surface-variant hover:text-foreground transition-colors p-1"
            aria-label="Back to reading config"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-secondary">
              {difficultyLabels[difficulty]} &middot; {passageIdx + 1}/{passages.length}
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-[2px] bg-outline-variant/20">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 md:py-10">
        {phase === "read" && (
          <div className="flex flex-col gap-6">
            {/* Title */}
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
                {passage.title}
              </h2>
            </div>

            {/* Passage Card */}
            <div className="bg-surface-lowest rounded-2xl p-6 md:p-8 shadow-[0_12px_40px_rgba(0,14,33,0.06)] border border-outline-variant/10">
              <p className="font-japanese text-xl md:text-2xl lg:text-[1.75rem] leading-relaxed md:leading-loose text-foreground tracking-wide">
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
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
                        <span className="text-secondary text-xs">({v.reading})</span>
                      )}
                      <span className="text-secondary">&mdash;</span>
                      <span className="text-on-surface-variant">{v.meaning}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Continue button */}
            <button
              type="button"
              onClick={handleNext}
              className="mt-2 btn-primary-gradient text-white font-bold py-3 px-8 rounded-xl shadow-[0_8px_24px_rgba(0,36,70,0.12)] hover:opacity-90 transition self-center"
            >
              Continue to Questions
            </button>
          </div>
        )}

        {phase === "questions" && (
          <div className="flex flex-col gap-6">
            {/* Passage reminder (collapsed) */}
            <div className="bg-surface-lowest rounded-xl p-4 border border-outline-variant/10">
              <p className="font-japanese text-sm md:text-base text-secondary leading-relaxed line-clamp-2">
                {passage.passage}
              </p>
            </div>

            {/* Question */}
            <div className="bg-surface-lowest rounded-2xl p-6 md:p-8 shadow-[0_12px_40px_rgba(0,14,33,0.06)]">
              <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">
                Question {questionIdx + 1} of {passage.questions.length}
              </p>
              <h3 className="font-display text-lg md:text-xl font-bold text-foreground mb-6">
                {passage.questions[questionIdx].question}
              </h3>

              <div className="flex flex-col gap-3">
                {passage.questions[questionIdx].options.map((option, i) => {
                  let optionStyle =
                    "border-outline-variant/30 hover:border-primary/40 hover:bg-primary/5";
                  if (answered) {
                    if (i === passage.questions[questionIdx].correctIndex) {
                      optionStyle =
                        "border-success bg-success/10 text-foreground";
                    } else if (i === selectedAnswer) {
                      optionStyle = "border-error bg-error/10 text-foreground";
                    } else {
                      optionStyle =
                        "border-outline-variant/20 opacity-50";
                    }
                  } else if (i === selectedAnswer) {
                    optionStyle = "border-primary bg-primary/10";
                  }

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (!answered) setSelectedAnswer(i);
                      }}
                      disabled={answered}
                      className={`w-full text-left rounded-xl border-2 px-4 py-3 md:py-3.5 transition-all ${optionStyle}`}
                    >
                      <span className="text-sm md:text-base font-medium">
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
                    {questionIdx < passage.questions.length - 1
                      ? "Next Question"
                      : passageIdx < passages.length - 1
                        ? "Next Passage"
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
