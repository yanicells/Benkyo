"use client";

import { useState } from "react";
import type { Card, CardType } from "@/lib/types";

const previewTypeLabels: Record<CardType, string> = {
  vocab: "Vocab",
  grammar: "Grammar",
  "fill-in": "Fill In",
  conjugation: "Conjug.",
  translate: "Translate",
  culture: "Culture",
};

type CardPreviewListProps = {
  cards: Card[];
  title?: string;
  maxVisible?: number;
  preserveNewlines?: boolean;
};

export function CardPreviewList({
  cards,
  title = "Card preview",
  maxVisible = 20,
  preserveNewlines = false,
}: CardPreviewListProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleCards = showAll ? cards : cards.slice(0, maxVisible);
  const hasMore = cards.length > maxVisible;

  return (
    <div className="rounded-2xl bg-surface-lowest p-5 shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-[0.22em] text-primary font-bold">
          {title}
        </p>
        <p className="text-xs text-on-surface-variant">{cards.length} entries</p>
      </div>
      <div className="space-y-2">
        {visibleCards.map((card, i) => (
          <div
            key={`${card.front}-${card.back}-${i}`}
            className={`flex gap-2 rounded-lg bg-surface-low px-3 py-2 ${preserveNewlines ? "items-start" : "items-center"}`}
          >
            <span className="inline-flex h-6 w-24 shrink-0 items-center justify-center self-center rounded-lg bg-surface-lowest px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
              {previewTypeLabels[card.type]}
            </span>
            <div className="min-w-0">
              <p
                className={`font-sans text-xl font-medium text-foreground ${preserveNewlines ? "whitespace-pre-line" : ""}`}
              >
                {card.front}
              </p>
              <p
                className={`mt-1 text-sm text-on-surface-variant ${preserveNewlines ? "whitespace-pre-line font-japanese" : ""}`}
              >
                {card.back}
              </p>
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="mt-3 w-full text-center text-xs font-bold text-primary hover:underline"
        >
          {showAll ? "Show less" : `Show all ${cards.length} cards`}
        </button>
      )}
    </div>
  );
}
