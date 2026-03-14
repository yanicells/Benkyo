"use client";

import { useMemo, useState } from "react";

type TypingPracticeInputProps = {
  expected: string;
  label: string;
  placeholder: string;
  showExpected?: boolean;
  onComplete: () => void;
  onGiveUp?: () => void;
  giveUpLabel?: string;
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function TypingPracticeInput({
  expected,
  label,
  placeholder,
  showExpected = true,
  onComplete,
  onGiveUp,
  giveUpLabel = "Give up",
}: TypingPracticeInputProps) {
  const [typed, setTyped] = useState("");
  const [errorState, setErrorState] = useState(false);

  const normalizedExpected = useMemo(() => normalize(expected), [expected]);

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
        onComplete();
        setTyped("");
        setErrorState(false);
        return;
      }

      setTyped(normalizedIncoming);
      setErrorState(false);
      return;
    }

    setErrorState(true);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-rose-950/10 bg-white/70 p-4">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-rose-700">
          {label}
        </p>
        <div className="flex flex-wrap gap-1 text-xl sm:text-2xl">
          {showExpected
            ? normalizedExpected.split("").map((character, index) => {
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
              })
            : typed.split("").map((character, index) => {
                const isCorrect = normalizedExpected[index] === character;

                return (
                  <span
                    key={`${character}-${index}`}
                    className={`rounded px-1 ${
                      isCorrect
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {character}
                  </span>
                );
              })}
        </div>
      </div>

      <input
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
      />

      {onGiveUp ? (
        <button
          type="button"
          onClick={onGiveUp}
          className="rounded-full border border-rose-900/20 px-4 py-2 text-sm font-semibold uppercase tracking-[0.15em] text-rose-800 transition hover:border-rose-900/40 hover:bg-rose-100"
        >
          {giveUpLabel}
        </button>
      ) : null}
    </div>
  );
}
