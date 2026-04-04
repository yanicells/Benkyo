"use client";

import { useState } from "react";

import type { Lesson } from "@/lib/types";
import {
  getDueCards,
  getLifetimeStats,
  getStreak,
  getTodayStats,
  getLast30DaysAccuracy,
  getWeakCards,
  getMasteryPercent,
  getSubDeckAccuracy,
} from "@/lib/srs";
import { AccuracyChart } from "@/components/stats/accuracy-chart";
import { SettingsModal } from "@/components/stats/settings-modal";

type StatsClientProps = {
  lessons: Lesson[];
};

type StatsData = {
  lifetime: ReturnType<typeof getLifetimeStats>;
  streak: ReturnType<typeof getStreak>;
  today: ReturnType<typeof getTodayStats>;
  dueCount: number;
  chartData: ReturnType<typeof getLast30DaysAccuracy>;
  weak: ReturnType<typeof getWeakCards>;
};

function hasJapaneseGlyphs(value: string) {
  return /[\u3040-\u30ff\u3400-\u9fff]/.test(value);
}

export function StatsClient({ lessons }: StatsClientProps) {
  const [showSettings, setShowSettings] = useState(false);

  const [data] = useState<StatsData | null>(() => {
    if (typeof window === "undefined") return null;
    return {
      lifetime: getLifetimeStats(lessons),
      streak: getStreak(),
      today: getTodayStats(),
      dueCount: getDueCards(lessons).length,
      chartData: getLast30DaysAccuracy(),
      weak: getWeakCards(lessons),
    };
  });

  if (!data) {
    return (
      <div className="rounded-lg bg-surface-lowest p-6 text-center shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
        <p className="text-sm text-on-surface-variant">Loading stats...</p>
      </div>
    );
  }

  const { lifetime, streak, today, dueCount, chartData, weak } = data;
  const todayAccuracy =
    today.reviewed > 0 ? Math.round((today.correct / today.reviewed) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Overview cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-surface-lowest p-4 text-center shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
          <p className="text-3xl font-bold text-foreground">
            {lifetime.totalReviews}
          </p>
          <p className="mt-1 text-xs uppercase tracking-wider text-on-surface-variant">
            Total reviews
          </p>
        </div>
        <div className="rounded-lg bg-surface-lowest p-4 text-center shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
          <p className="text-3xl font-bold text-foreground">{streak.current}</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-on-surface-variant">
            Day streak
          </p>
        </div>
        <div className="rounded-lg bg-surface-lowest p-4 text-center shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
          <p className="text-3xl font-bold text-foreground">
            {lifetime.mastered}
          </p>
          <p className="mt-1 text-xs uppercase tracking-wider text-on-surface-variant">
            Cards mastered
          </p>
        </div>
        <div className="rounded-lg bg-surface-lowest p-4 text-center shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
          <p className="text-3xl font-bold text-foreground">{todayAccuracy}%</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-on-surface-variant">
            Today&apos;s accuracy
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm text-on-surface-variant">
        <span>{dueCount} cards due today</span>
        <span>&middot;</span>
        <span>{today.reviewed} reviewed today</span>
      </div>

      {/* Accuracy chart */}
      {chartData.length > 0 && (
        <section className="rounded-lg bg-surface-lowest p-5 shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
          <p className="mb-4 text-xs uppercase tracking-[0.22em] text-primary">
            Accuracy — last 30 days
          </p>
          <AccuracyChart data={chartData} />
        </section>
      )}

      {/* Per-lesson breakdown */}
      <section className="space-y-3">
        <p className="font-display text-xs uppercase tracking-[0.22em] text-primary">
          Per-lesson breakdown
        </p>
        {lessons.map((lesson) => (
          <LessonAccordion key={lesson.id} lesson={lesson} />
        ))}
      </section>

      {/* Weak cards */}
      {weak.length > 0 && (
        <section className="rounded-lg bg-surface-lowest p-5 shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-primary">
            Weakest cards
          </p>
          <div className="space-y-2">
            {weak.map((w) => (
              <div
                key={w.cardId}
                className="flex items-center justify-between gap-2 rounded-lg bg-surface-low px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate font-japanese-display text-lg text-foreground">
                    {w.card.front}
                  </p>
                  <p className="text-xs text-on-surface-variant">{w.subDeckTitle}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display text-sm font-semibold text-primary">
                    {w.accuracy}%
                  </p>
                  <p className="text-[10px] text-on-surface-variant">
                    last: {w.lastReview}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Settings */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowSettings(true)}
          className="rounded-lg bg-surface-low px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-primary transition hover:bg-secondary-container"
        >
          Settings & Data
        </button>
      </div>

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

function LessonAccordion({ lesson }: { lesson: Lesson }) {
  const [open, setOpen] = useState(false);
  const lessonTitleFont = hasJapaneseGlyphs(lesson.title)
    ? "font-japanese-display"
    : "font-display";

  return (
    <div className="rounded-lg bg-surface-lowest shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div>
          <h3 className={`${lessonTitleFont} text-xl font-semibold text-foreground`}>
            {lesson.title}
          </h3>
          <p className="text-xs text-on-surface-variant">
            <span className="font-display text-foreground">
              {lesson.subDecks.length}
            </span>{" "}
            sub-decks &middot;{" "}
            <span className="font-display text-foreground">
              {lesson.subDecks.reduce((s, sd) => s + sd.cards.length, 0)}
            </span>{" "}
            cards
          </p>
        </div>
        <svg
          className={`h-5 w-5 text-on-surface-variant transition ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19 9-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="bg-surface-low p-4">
          <div className="space-y-2">
            {lesson.subDecks.map((sd) => {
              const mastery = getMasteryPercent(sd.id, sd.cards.length);
              const accuracy = getSubDeckAccuracy(sd.id, sd.cards.length);
              const subDeckTitleFont = hasJapaneseGlyphs(sd.title)
                ? "font-japanese-display"
                : "font-display";

              return (
                <div
                  key={sd.id}
                  className="flex items-center justify-between gap-2 rounded-lg bg-surface-lowest px-3 py-2"
                >
                  <div className="min-w-0">
                    <p
                      className={`truncate text-sm font-medium text-foreground ${subDeckTitleFont}`}
                    >
                      {sd.title}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      <span className="font-display text-foreground">
                        {sd.cards.length}
                      </span>{" "}
                      cards
                    </p>
                  </div>
                  <div className="flex gap-3 text-xs text-on-surface-variant">
                    <span>
                      <span className="font-display text-foreground">
                        {mastery}%
                      </span>{" "}
                      mastered
                    </span>
                    {accuracy > 0 && (
                      <span>
                        <span className="font-display text-foreground">
                          {accuracy}%
                        </span>{" "}
                        acc
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
