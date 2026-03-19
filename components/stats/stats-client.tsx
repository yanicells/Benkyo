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
      <div className="rounded-2xl border border-rose-900/10 bg-white p-6 text-center">
        <p className="text-sm text-slate-700">Loading stats...</p>
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
        <div className="rounded-2xl border border-rose-900/10 bg-white p-4 text-center">
          <p className="text-3xl font-bold text-slate-900">
            {lifetime.totalReviews}
          </p>
          <p className="mt-1 text-xs uppercase tracking-wider text-slate-600">
            Total reviews
          </p>
        </div>
        <div className="rounded-2xl border border-rose-900/10 bg-white p-4 text-center">
          <p className="text-3xl font-bold text-slate-900">{streak.current}</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-slate-600">
            Day streak
          </p>
        </div>
        <div className="rounded-2xl border border-rose-900/10 bg-white p-4 text-center">
          <p className="text-3xl font-bold text-slate-900">
            {lifetime.mastered}
          </p>
          <p className="mt-1 text-xs uppercase tracking-wider text-slate-600">
            Cards mastered
          </p>
        </div>
        <div className="rounded-2xl border border-rose-900/10 bg-white p-4 text-center">
          <p className="text-3xl font-bold text-slate-900">{todayAccuracy}%</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-slate-600">
            Today&apos;s accuracy
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm text-slate-700">
        <span>{dueCount} cards due today</span>
        <span>&middot;</span>
        <span>{today.reviewed} reviewed today</span>
      </div>

      {/* Accuracy chart */}
      {chartData.length > 0 && (
        <section className="rounded-2xl border border-rose-900/10 bg-white p-5">
          <p className="mb-4 text-xs uppercase tracking-[0.22em] text-rose-700">
            Accuracy — last 30 days
          </p>
          <AccuracyChart data={chartData} />
        </section>
      )}

      {/* Per-lesson breakdown */}
      <section className="space-y-3">
        <p className="text-xs uppercase tracking-[0.22em] text-rose-700">
          Per-lesson breakdown
        </p>
        {lessons.map((lesson) => (
          <LessonAccordion key={lesson.id} lesson={lesson} />
        ))}
      </section>

      {/* Weak cards */}
      {weak.length > 0 && (
        <section className="rounded-2xl border border-rose-900/10 bg-white p-5">
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-rose-700">
            Weakest cards
          </p>
          <div className="space-y-2">
            {weak.map((w) => (
              <div
                key={w.cardId}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate font-display text-lg text-slate-900">
                    {w.card.front}
                  </p>
                  <p className="text-xs text-slate-500">{w.subDeckTitle}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-rose-700">
                    {w.accuracy}%
                  </p>
                  <p className="text-[10px] text-slate-500">
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
          className="rounded-full border border-rose-900/20 px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-rose-800 transition hover:border-rose-900/40 hover:bg-rose-50"
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

  return (
    <div className="rounded-2xl border border-rose-900/10 bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div>
          <h3 className="font-display text-xl text-slate-900">
            {lesson.title}
          </h3>
          <p className="text-xs text-slate-600">
            {lesson.subDecks.length} sub-decks &middot;{" "}
            {lesson.subDecks.reduce((s, sd) => s + sd.cards.length, 0)} cards
          </p>
        </div>
        <svg
          className={`h-5 w-5 text-slate-500 transition ${open ? "rotate-180" : ""}`}
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
        <div className="border-t border-rose-900/10 p-4">
          <div className="space-y-2">
            {lesson.subDecks.map((sd) => {
              const mastery = getMasteryPercent(sd.id, sd.cards.length);
              const accuracy = getSubDeckAccuracy(sd.id, sd.cards.length);

              return (
                <div
                  key={sd.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {sd.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {sd.cards.length} cards
                    </p>
                  </div>
                  <div className="flex gap-3 text-xs text-slate-600">
                    <span>{mastery}% mastered</span>
                    {accuracy > 0 && <span>{accuracy}% acc</span>}
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
