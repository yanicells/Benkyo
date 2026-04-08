"use client";

import Link from "next/link";
import type { ReadingPassage, ReadingDifficulty } from "@/lib/types";

type ReadingConfigClientProps = {
  passages: ReadingPassage[];
};

const difficulties: {
  key: ReadingDifficulty;
  label: string;
  description: string;
  detail: string;
  color: string;
  bgColor: string;
  icon: string;
}[] = [
  {
    key: "simple",
    label: "Simple",
    description: "Short sentences in hiragana with basic vocabulary.",
    detail: "Greetings, numbers, and everyday phrases",
    color: "text-[#2a9a8c]",
    bgColor: "bg-[#8ef4e4]",
    icon: "\u3072",
  },
  {
    key: "intermediate",
    label: "Intermediate",
    description: "Longer passages mixing hiragana and katakana.",
    detail: "Self-introductions, shopping, and daily conversations",
    color: "text-primary",
    bgColor: "bg-primary/10",
    icon: "\u30AB",
  },
  {
    key: "hard",
    label: "Hard",
    description: "Paragraphs with kanji, furigana support, and complex grammar.",
    detail: "Stories about school, travel, and weekly activities",
    color: "text-[#b45309]",
    bgColor: "bg-[#fef3c7]",
    icon: "\u8AAD",
  },
];

export function ReadingConfigClient({ passages }: ReadingConfigClientProps) {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {difficulties.map((d) => {
        const count = passages.filter((p) => p.difficulty === d.key).length;
        return (
          <Link
            key={d.key}
            href={`/reading/session?difficulty=${d.key}`}
            className="group rounded-2xl bg-surface-lowest p-5 md:p-6 shadow-[0_12px_40px_rgba(0,14,33,0.06)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex items-center gap-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div
              className={`h-14 w-14 md:h-16 md:w-16 rounded-2xl ${d.bgColor} flex items-center justify-center shrink-0`}
            >
              <span
                className={`font-japanese-display text-2xl md:text-3xl ${d.color}`}
                aria-hidden
              >
                {d.icon}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-display font-bold text-lg md:text-xl text-foreground">
                  {d.label}
                </h3>
                <span className="text-xs text-secondary">
                  {count} {count === 1 ? "passage" : "passages"}
                </span>
              </div>
              <p className="text-sm text-secondary leading-relaxed">
                {d.description}
              </p>
              <p className="text-xs text-on-surface-variant mt-1 hidden md:block">
                {d.detail}
              </p>
            </div>
            <svg
              className="w-5 h-5 text-on-surface-variant/40 group-hover:text-primary transition-colors shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        );
      })}
    </div>
  );
}
