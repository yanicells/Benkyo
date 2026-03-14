"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type TypingPracticeInputProps = {
  expected: string;
  label?: string;
  placeholder: string;
  showExpected?: boolean;
  manualAdvance?: boolean;
  nextLabel?: string;
  controlsAlign?: "left" | "right" | "between";
  onComplete: () => void;
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
  nextLabel = "Next",
  controlsAlign = "left",
  onComplete,
  onGiveUp,
  giveUpLabel = "Skip",
}: TypingPracticeInputProps) {
  const [typed, setTyped] = useState("");
  const [errorState, setErrorState] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const normalizedExpected = useMemo(() => normalize(expected), [expected]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const isReady = typed.length > 0 && typed === normalizedExpected;

  const onChange = (value: string) => {
    const normalizedIncoming = normalize(value);

    if (normalizedIncoming.length < typed.length) {
      setTyped(normalizedIncoming);
      setErrorState(false);
      return;
    }

    if (normalizedExpected.startsWith(normalizedIncoming)) {
      if (
        normalizedIncoming.length > 0 &&
        normalizedIncoming === normalizedExpected
      ) {
        if (!manualAdvance) {
          onComplete();
          setTyped("");
          setErrorState(false);
          return;
        }
      }

      setTyped(normalizedIncoming);
      setErrorState(false);
      return;
    }

    setErrorState(true);
  };

  return (
    <div className="space-y-4">
      {label ? <p className="text-sm text-slate-700">{label}</p> : null}

      {showExpected ? (
        <div className="rounded-2xl border border-rose-950/10 bg-white/70 p-4">
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
                        : "bg-slate-100 text-slate-400"
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
          className={`w-full rounded-xl border bg-white px-4 py-3 text-lg lowercase outline-none transition ${
            errorState
              ? "border-red-500 ring-2 ring-red-200"
              : "border-rose-900/20 focus:border-rose-600 focus:ring-2 focus:ring-rose-200"
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
          className={`flex items-center gap-2 ${
            controlsAlign === "right"
              ? "justify-end"
              : controlsAlign === "between"
                ? "justify-between"
                : "justify-start"
          }`}
        >
          {onGiveUp ? (
            <button
              type="button"
              onClick={() => {
                onGiveUp();
                setTyped("");
                setErrorState(false);
                inputRef.current?.focus();
              }}
              className="rounded-full border border-rose-900/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-rose-800 transition hover:border-rose-900/40 hover:bg-rose-100 sm:text-sm"
            >
              {giveUpLabel}
            </button>
          ) : null}

          {manualAdvance ? (
            <button
              type="button"
              disabled={!isReady}
              onClick={() => {
                if (!isReady) {
                  return;
                }

                onComplete();
                setTyped("");
                setErrorState(false);
                inputRef.current?.focus();
              }}
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:text-sm"
            >
              {nextLabel}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
