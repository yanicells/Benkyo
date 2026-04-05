"use client";

import { useState, useRef, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

import type { Lesson } from "@/lib/types";
import {
  getDueCards,
  getLifetimeStats,
  getStreak,
  getTodayStats,
  getLast30DaysAccuracy,
  getLast30DaysActivity,
  getMasteryTimeline,
  getWeakCards,
  getMasteryPercent,
  getSubDeckAccuracy,
} from "@/lib/srs";
import { SettingsModal } from "@/components/stats/settings-modal";

// Lazy-load chart components to avoid Recharts SSR issues
const DailyActivityChart = dynamic(
  () =>
    import("@/components/stats/daily-activity-chart").then((m) => ({
      default: m.DailyActivityChart,
    })),
  { ssr: false },
);
const AccuracyTrendChart = dynamic(
  () =>
    import("@/components/stats/accuracy-trend-chart").then((m) => ({
      default: m.AccuracyTrendChart,
    })),
  { ssr: false },
);
const MasteryTrendChart = dynamic(
  () =>
    import("@/components/stats/mastery-trend-chart").then((m) => ({
      default: m.MasteryTrendChart,
    })),
  { ssr: false },
);

type ChartTab = "activity" | "accuracy" | "mastery";

type StatsClientProps = {
  lessons: Lesson[];
  hideOverview?: boolean;
};

type StatsData = {
  lifetime: ReturnType<typeof getLifetimeStats>;
  streak: ReturnType<typeof getStreak>;
  today: ReturnType<typeof getTodayStats>;
  dueCount: number;
  activityData: ReturnType<typeof getLast30DaysActivity>;
  accuracyData: ReturnType<typeof getLast30DaysAccuracy>;
  masteryData: ReturnType<typeof getMasteryTimeline>;
  weak: ReturnType<typeof getWeakCards>;
};

function hasJapaneseGlyphs(value: string) {
  return /[\u3040-\u30ff\u3400-\u9fff]/.test(value);
}

// Noop subscribe — localStorage doesn't push reactive updates
const subscribeNoop = () => () => {};

export function StatsClient({
  lessons,
  hideOverview = false,
}: StatsClientProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [chartTab, setChartTab] = useState<ChartTab>("activity");

  // Cache so getSnapshot returns a stable reference (useSyncExternalStore requires it)
  const cacheRef = useRef<StatsData | null>(null);

  // useSyncExternalStore correctly uses getServerSnapshot during SSR/hydration,
  // then switches to getSnapshot after hydration — no mismatch.
  const data = useSyncExternalStore(
    subscribeNoop,
    () => {
      if (cacheRef.current === null) {
        cacheRef.current = {
          lifetime: getLifetimeStats(lessons),
          streak: getStreak(),
          today: getTodayStats(),
          dueCount: getDueCards(lessons).length,
          activityData: getLast30DaysActivity(),
          accuracyData: getLast30DaysAccuracy(),
          masteryData: getMasteryTimeline(lessons),
          weak: getWeakCards(lessons),
        };
      }
      return cacheRef.current;
    },
    () => null, // server snapshot — null tells us we're in SSR/hydration
  );

  const isLoaded = data !== null;
  const lifetime = data?.lifetime ?? {
    totalReviews: 0,
    mastered: 0,
    totalCards: 0,
    totalCorrect: 0,
  };
  const streak = data?.streak ?? { current: 0, lastDate: "" };
  const today = data?.today ?? { reviewed: 0, correct: 0, timeSpentSeconds: 0 };
  const dueCount = data?.dueCount ?? 0;
  const activityData = data?.activityData ?? [];
  const accuracyData = data?.accuracyData ?? [];
  const masteryData = data?.masteryData ?? [];
  const weak = data?.weak ?? [];

  // Show "—" when there are no reviews today — 0% would be misleading
  const todayAccuracyDisplay =
    isLoaded && today.reviewed > 0
      ? `${Math.round((today.correct / today.reviewed) * 100)}%`
      : isLoaded
        ? "—"
        : "…";

  const isNewUser = isLoaded && lifetime.totalReviews === 0;

  return (
    <div className="space-y-6">
      {/* No-data callout for new users */}
      {isNewUser && (
        <div className="rounded-lg bg-surface-lowest p-6 text-center shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
          <p
            className="font-japanese-display text-5xl text-primary/20 mb-3 select-none"
            aria-hidden
          >
            統計
          </p>
          <h2 className="font-display text-base font-bold text-foreground mb-1">
            No study data yet
          </h2>
          <p className="text-sm text-on-surface-variant mb-5">
            Complete a deck session or review to start tracking your progress.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link
              href="/decks"
              className="btn-primary-gradient rounded-lg px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Study a Deck
            </Link>
            <Link
              href="/review"
              className="rounded-lg bg-surface-low px-5 py-2 text-sm font-semibold text-primary transition hover:bg-secondary-container"
            >
              Go to Review
            </Link>
          </div>
        </div>
      )}

      {!hideOverview && (
        <>
          {/* Overview cards — always shown; source noted in sublabel */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-lg bg-surface-lowest p-4 text-center shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
              <p className="text-2xl font-bold text-foreground sm:text-3xl">
                {lifetime.totalReviews}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wider text-on-surface-variant">
                Total reviews
              </p>
            </div>
            <div className="rounded-lg bg-surface-lowest p-4 text-center shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
              <p className="text-2xl font-bold text-foreground sm:text-3xl">
                {streak.current}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wider text-on-surface-variant">
                Day streak
              </p>
            </div>
            <div className="rounded-lg bg-surface-lowest p-4 text-center shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
              <p className="text-2xl font-bold text-foreground sm:text-3xl">
                {lifetime.mastered}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wider text-on-surface-variant">
                Cards mastered
              </p>
              {/* Clarify the mastery criterion so the number has a clear meaning */}
              <p className="mt-0.5 text-[10px] text-on-surface-variant/60">
                interval ≥ 21 days
              </p>
            </div>
            <div className="rounded-lg bg-surface-lowest p-4 text-center shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
              <p className="text-2xl font-bold text-foreground sm:text-3xl">
                {todayAccuracyDisplay}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wider text-on-surface-variant">
                Today&apos;s accuracy
              </p>
              {/* Show the denominator so the percentage has context */}
              {today.reviewed > 0 && (
                <p className="mt-0.5 text-[10px] text-on-surface-variant/60">
                  {today.correct}/{today.reviewed} correct
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-on-surface-variant">
            <span>
              <span className="font-semibold text-foreground">{dueCount}</span>{" "}
              {dueCount === 1 ? "card" : "cards"} due today
            </span>
            <span>&middot;</span>
            <span>
              <span className="font-semibold text-foreground">
                {today.reviewed}
              </span>{" "}
              reviewed today
            </span>
          </div>
        </>
      )}

      {/* Progress charts with tab selector */}
      <section className="rounded-lg bg-surface-lowest p-5 shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
        {/* Tab bar */}
        <div className="flex gap-1 mb-5 rounded-lg bg-surface-low p-1">
          {(
            [
              { key: "activity", label: "Daily Activity" },
              { key: "accuracy", label: "Accuracy" },
              { key: "mastery", label: "Mastery" },
            ] as { key: ChartTab; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setChartTab(key)}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${
                chartTab === key
                  ? "bg-surface-lowest text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-on-surface-variant/60">
          Last 30 days
        </p>

        {chartTab === "activity" && <DailyActivityChart data={activityData} />}
        {chartTab === "accuracy" && <AccuracyTrendChart data={accuracyData} />}
        {chartTab === "mastery" && <MasteryTrendChart data={masteryData} />}

        {chartTab === "activity" && (
          <div className="mt-3 flex items-center gap-4 text-[10px] text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" />
              Correct
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-secondary-container" />
              Total
            </span>
          </div>
        )}
      </section>

      {/* Per-lesson breakdown */}
      <section className="space-y-3">
        <p className="font-display text-xs uppercase tracking-[0.22em] text-primary">
          Per-lesson breakdown
        </p>
        {lessons.map((lesson) => (
          <LessonAccordion key={lesson.id} lesson={lesson} />
        ))}
      </section>

      {/* Weakest cards — always render the section; show empty state when no weak cards */}
      <section className="rounded-lg bg-surface-lowest p-5 shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
        <p className="mb-3 text-xs uppercase tracking-[0.22em] text-primary">
          Weakest cards
        </p>
        {weak.length > 0 ? (
          <div className="space-y-2">
            {weak.map((w) => (
              <div
                key={w.cardId}
                className="flex items-center justify-between gap-2 rounded-lg bg-surface-low px-3 py-2"
              >
                <div className="min-w-0">
                  <p
                    className={`truncate text-lg text-foreground ${
                      hasJapaneseGlyphs(w.card.front)
                        ? "font-japanese-display"
                        : "font-display"
                    }`}
                  >
                    {w.card.front}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {w.subDeckTitle}
                  </p>
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
        ) : (
          <p className="py-4 text-center text-sm text-on-surface-variant">
            {isNewUser
              ? "No review history yet."
              : "No weak cards — cards appear here after 2+ reviews with accuracy data."}
          </p>
        )}
      </section>

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

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
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
          <h3
            className={`${lessonTitleFont} text-xl font-semibold text-foreground`}
          >
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
