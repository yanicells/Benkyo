"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type TypingPracticeInputProps = {
  expected: string;
  label?: string;
  placeholder: string;
  showExpected?: boolean;
  manualAdvance?: boolean;
  manualAdvanceValidation?: "exact" | "non-empty";
  liveFeedback?: "easy" | "hard";
  nextLabel?: string;
  controlsAlign?: "left" | "right" | "between";
  onSubmit: (result: {
    typed: string;
    expected: string;
    isCorrect: boolean;
  }) => void;
  onGiveUp?: () => void;
  giveUpLabel?: string;
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "").trim();
}

export function TypingPracticeInput({
  expected,
  label,
  placeholder,
  showExpected = true,
  manualAdvance = false,
  manualAdvanceValidation = "exact",
  liveFeedback = "easy",
  nextLabel = "Next",
  controlsAlign = "left",
  onSubmit,
  onGiveUp,
  giveUpLabel = "Skip",
}: TypingPracticeInputProps) {
  const [typed, setTyped] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const normalizedExpected = useMemo(() => normalize(expected), [expected]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const isCorrect = typed.length > 0 && typed === normalizedExpected;
  const canSubmit =
    manualAdvanceValidation === "non-empty"
      ? typed.length > 0
      : typed.length > 0 && typed === normalizedExpected;

  const hasPrefixMismatch =
    typed.length > 0 && !normalizedExpected.startsWith(typed);
  const showErrorState = liveFeedback === "easy" && hasPrefixMismatch;

  const submitCurrentValue = () => {
    if (!canSubmit) {
      return;
    }

    onSubmit({
      typed,
      expected: normalizedExpected,
      isCorrect,
    });
    setTyped("");
    inputRef.current?.focus();
  };

  const onChange = (value: string) => {
    const normalizedIncoming = normalize(value);
    setTyped(normalizedIncoming);

    if (!manualAdvance && normalizedIncoming === normalizedExpected) {
      onSubmit({
        typed: normalizedIncoming,
        expected: normalizedExpected,
        isCorrect: true,
      });
      setTyped("");
    }
  };

  return (
    <div className="space-y-4">
      {label ? (
        <p className="text-sm text-on-surface-variant">{label}</p>
      ) : null}

      {showExpected ? (
        <div className="rounded-lg bg-surface-low p-4">
          <div className="flex flex-wrap gap-1 text-xl sm:text-2xl">
            {normalizedExpected.split("").map((character, index) => {
              const typedCharacter = typed[index];
              const isCorrect = typedCharacter === character;
              const isCurrent = typed.length === index;

              return (
                <span
                  key={`${character}-${index}`}
                  className={`rounded px-1 transition ${
                    isCorrect
                      ? "bg-emerald-100 text-emerald-700"
                      : isCurrent
                        ? "bg-amber-100 text-amber-800"
                        : "bg-surface-low text-on-surface-variant/40"
                  }`}
                >
                  {character}
                </span>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={typed}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter" || !manualAdvance) {
              return;
            }

            event.preventDefault();
            submitCurrentValue();
          }}
          className={`w-full rounded-lg border bg-white px-4 py-3 text-lg lowercase outline-none shadow-none transition ${
            showErrorState
              ? "border-error focus:border-error focus:ring-0 focus:shadow-none"
              : "border-outline-variant/20 focus:border-primary focus:ring-0 focus:shadow-none"
          }`}
          placeholder={placeholder}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
        />
      </div>

      {onGiveUp || manualAdvance ? (
        <div
          className={
            onGiveUp && manualAdvance && controlsAlign === "between"
              ? "grid grid-cols-2 gap-2"
              : `flex items-center gap-2 ${
                  controlsAlign === "right"
                    ? "justify-end"
                    : controlsAlign === "between"
                      ? "justify-between"
                      : "justify-start"
                }`
          }
        >
          {onGiveUp ? (
            <button
              type="button"
              onClick={() => {
                onGiveUp();
                setTyped("");
                inputRef.current?.focus();
              }}
              className="min-h-11 w-full rounded-lg bg-surface-low px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.15em] text-primary transition hover:bg-secondary-container"
            >
              {giveUpLabel}
            </button>
          ) : null}

          {manualAdvance ? (
            <button
              type="button"
              disabled={!canSubmit}
              onClick={submitCurrentValue}
              className="btn-primary-gradient min-h-11 w-full rounded-lg px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {nextLabel}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
