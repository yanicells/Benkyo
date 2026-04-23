"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

import type { Lesson } from "@/lib/types";
import {
  getStreak,
  getDueCards,
  getSettings,
  getTodayStats,
  getAllDailyStats,
  getLifetimeStats,
  getLessonMastery,
  subscribeToStudyData,
  getStudyDataRevision,
} from "@/lib/srs";

type HomeClientProps = {
  lessons: Lesson[];
};

type DayActivity = {
  label: string;
  reviewed: number;
  isToday: boolean;
};

type ClientData = {
  streakDays: number;
  dueCount: number;
  todayReviewed: number;
  dailyGoal: number;
  weeklyMinutes: number;
  weeklyReviewed: number;
  sevenDayActivity: DayActivity[];
  cardsMastered: number;
  totalCards: number;
  quickStartId: string;
};

function getQuickStartLesson(lessons: Lesson[]) {
  if (lessons.length === 0) return null;
  const active = lessons.find((l) => getLessonMastery(l) < 100);
  return active ?? lessons[0];
}

function readClientData(lessons: Lesson[]): ClientData {
  const dueCards = getDueCards(lessons);
  const settings = getSettings();
  const todayStats = getTodayStats();
  const streak = getStreak();
  const lifetime = getLifetimeStats(lessons);
  const allDaily = getAllDailyStats();
  const qsl = getQuickStartLesson(lessons);

  const today = new Date();
  let weeklySeconds = 0;
  let weeklyReviewed = 0;
  const sevenDayActivity: DayActivity[] = [];
  const dayLabels = ["Su", "M", "Tu", "W", "Th", "F", "Sa"];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const stats = allDaily[key] ?? {
      reviewed: 0,
      correct: 0,
      timeSpentSeconds: 0,
    };
    weeklySeconds += stats.timeSpentSeconds;
    weeklyReviewed += stats.reviewed;
    sevenDayActivity.push({
      label: dayLabels[d.getDay()],
      reviewed: stats.reviewed,
      isToday: i === 0,
    });
  }

  return {
    streakDays: streak.current,
    dueCount: dueCards.length,
    todayReviewed: todayStats.reviewed,
    dailyGoal: settings.dailyGoal,
    weeklyMinutes: Math.round(weeklySeconds / 60),
    weeklyReviewed,
    sevenDayActivity,
    cardsMastered: lifetime.mastered,
    totalCards: lifetime.totalCards,
    quickStartId: qsl?.id ?? lessons[0]?.id ?? "",
  };
}

function DailyGoalRing({
  reviewed,
  goal,
  loaded,
  compact = false,
  mini = false,
  showValue = true,
}: {
  reviewed: number;
  goal: number;
  loaded: boolean;
  compact?: boolean;
  mini?: boolean;
  showValue?: boolean;
}) {
  const size = mini ? 32 : compact ? 56 : 96;
  const center = size / 2;
  const radius = mini ? 12 : compact ? 22 : 38;
  const strokeWidth = mini ? 3 : compact ? 4 : 5;
  const pct = loaded ? Math.min(reviewed / goal, 1) : 0;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const done = loaded && reviewed >= goal;

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={
        loaded
          ? `Daily goal: ${reviewed} of ${goal} cards reviewed`
          : "Daily goal loading"
      }
    >
      <svg
        className="-rotate-90"
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: size, height: size }}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--outline-variant)"
          strokeWidth={strokeWidth}
          opacity={0.3}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={done ? "var(--success)" : "var(--primary)"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {!loaded ? (
          <span
            className={`${mini ? "h-2 w-5" : compact ? "h-3 w-8" : "h-4 w-10"} rounded bg-outline-variant/30 animate-pulse block`}
          />
        ) : done ? (
          <svg
            className={`${mini ? "h-3 w-3" : compact ? "h-5 w-5" : "h-7 w-7"} text-success`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : showValue ? (
          <>
            <span
              className={`font-display ${mini ? "text-[10px]" : compact ? "text-lg" : "text-2xl"} font-extrabold text-foreground leading-none`}
            >
              {reviewed}
            </span>
            {!mini && (
              <span className="text-[10px] text-secondary mt-0.5">
                of {goal}
              </span>
            )}
          </>
        ) : (
          <span className="h-2 w-2 rounded-full bg-primary/50" aria-hidden />
        )}
      </div>
    </div>
  );
}

type LearningModeCardConfig = {
  href: string;
  ariaLabel: string;
  title: string;
  actionLabel: string;
  badge: string;
  badgeClass: string;
  panelClass: string;
  glyph: string;
  glyphClass: string;
  summary: string;
};

const LEARNING_MODE_CARDS: LearningModeCardConfig[] = [
  {
    href: "/decks",
    ariaLabel: "Browse lesson decks",
    title: "Lesson Decks",
    actionLabel: "Browse Lessons",
    badge: "STUDY",
    badgeClass: "bg-primary/10 text-primary",
    panelClass: "bg-gradient-to-br from-primary/10 to-primary/5",
    glyph: "学",
    glyphClass: "text-primary/20",
    summary: "Genki vocab & grammar with spaced repetition.",
  },
  {
    href: "/reading",
    ariaLabel: "Start reading practice",
    title: "Reading Practice",
    actionLabel: "Start Reading",
    badge: "PRACTICE",
    badgeClass: "bg-[#fef3c7] text-[#b45309]",
    panelClass: "bg-gradient-to-br from-[#fef3c7]/60 to-[#f59e0b]/10",
    glyph: "読",
    glyphClass: "text-[#b45309]/20",
    summary: "Sentences & paragraphs at three difficulty levels.",
  },
  {
    href: "/reviewer",
    ariaLabel: "Start reviewer test session",
    title: "Reviewer",
    actionLabel: "Start Reviewer",
    badge: "TEST",
    badgeClass: "bg-[#fce7f3] text-[#be185d]",
    panelClass: "bg-gradient-to-br from-[#fce7f3]/60 to-[#db2777]/10",
    glyph: "試",
    glyphClass: "text-[#be185d]/20",
    summary: "Translate & fill-in drills to test applied knowledge.",
  },
  {
    href: "/kana",
    ariaLabel: "Start kana practice session",
    title: "Kana Practice",
    actionLabel: "Start Session",
    badge: "FOUNDATION",
    badgeClass: "bg-[#8ef4e4] text-[#2a9a8c]",
    panelClass: "bg-[#eaeefd]",
    glyph: "ひ",
    glyphClass: "text-primary/20 italic",
    summary: "Drill hiragana & katakana with instant feedback.",
  },
  {
    href: "/path",
    ariaLabel: "View learning path",
    title: "Learning Path",
    actionLabel: "View Path",
    badge: "GUIDED",
    badgeClass: "bg-[#8ef4e4] text-[#2a9a8c]",
    panelClass: "bg-gradient-to-br from-[#8ef4e4]/20 to-[#2a9a8c]/10",
    glyph: "道",
    glyphClass: "text-[#2a9a8c]/20",
    summary: "Follow a structured path from beginner to fluent.",
  },
  {
    href: "/review",
    ariaLabel: "Start daily review session",
    title: "Daily Review",
    actionLabel: "Start Review",
    badge: "SRS",
    badgeClass: "bg-[#d1fae5] text-[#047857]",
    panelClass: "bg-gradient-to-br from-[#d1fae5]/60 to-[#10b981]/10",
    glyph: "復",
    glyphClass: "text-[#047857]/20",
    summary: "Spaced-repetition queue across everything you've learned.",
  },
];

function LearningModeCard({ mode }: { mode: LearningModeCardConfig }) {
  return (
    <Link
      href={mode.href}
      className="group rounded-[2rem] bg-surface-lowest overflow-hidden shadow-[0_12px_40px_rgba(0,14,33,0.06)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-row md:flex-col min-h-0 md:min-h-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={mode.ariaLabel}
    >
      <div
        className={`w-[30%] md:w-auto md:h-[45%] ${mode.panelClass} flex items-center justify-center relative overflow-hidden shrink-0`}
      >
        <span
          className={`font-japanese-display text-6xl md:text-8xl ${mode.glyphClass} group-hover:scale-110 transition-transform duration-500`}
          aria-hidden
        >
          {mode.glyph}
        </span>
      </div>
      <div className="flex-1 p-5 md:p-6 lg:p-8 flex flex-col justify-center md:justify-start">
        <div className="mb-2 md:mb-3">
          <span
            className={`inline-block md:hidden px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded w-fit ${mode.badgeClass}`}
          >
            {mode.badge}
          </span>
          <div className="hidden md:flex items-start justify-between gap-3">
            <h3 className="font-display font-bold text-lg md:text-xl text-foreground">
              {mode.title}
            </h3>
            <span
              className={`inline-block shrink-0 px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded w-fit ${mode.badgeClass}`}
            >
              {mode.badge}
            </span>
          </div>
          <h3 className="mt-1 font-display font-bold text-lg text-foreground md:hidden">
            {mode.title}
          </h3>
        </div>

        <p className="mt-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground md:hidden">
          {mode.actionLabel}
          <svg
            className="h-3.5 w-3.5 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </p>

        <p className="hidden text-xs text-secondary leading-relaxed md:block md:mb-4">
          {mode.summary}
        </p>
      </div>
    </Link>
  );
}

export function HomeClient({ lessons }: HomeClientProps) {
  const dataRevision = useSyncExternalStore(
    subscribeToStudyData,
    getStudyDataRevision,
    () => -1,
  );

  const data = useMemo(
    () => (dataRevision < 0 ? null : readClientData(lessons)),
    [lessons, dataRevision],
  );

  const loaded = data !== null;

  const streakDays = data?.streakDays ?? 0;
  const dueCount = data?.dueCount ?? 0;
  const todayReviewed = data?.todayReviewed ?? 0;
  const dailyGoal = data?.dailyGoal ?? 20;
  const weeklyMinutes = data?.weeklyMinutes ?? 0;
  const weeklyReviewed = data?.weeklyReviewed ?? 0;
  const sevenDayActivity = data?.sevenDayActivity ?? [];

  const maxActivity = Math.max(...sevenDayActivity.map((d) => d.reviewed), 1);

  return (
    <div className="w-full flex flex-col gap-8 md:gap-10 lg:gap-12">
      {/* Stats Cards - 3 columns */}
      <div className="grid grid-cols-3 gap-2.5 md:grid-cols-3 md:gap-4">
        {/* Streak Card */}
        <div className="bg-surface-lowest rounded-[1.5rem] md:rounded-[2rem] p-3 md:p-5 shadow-[0_12px_40px_rgba(0,14,33,0.06)]">
          <div className="flex flex-col items-center text-center gap-2 p-1 md:hidden">
            <div className="flex items-center justify-center">
              {loaded ? (
                <p className="font-display text-2xl font-extrabold text-foreground leading-none">
                  {streakDays}
                </p>
              ) : (
                <div className="h-7 w-10 rounded bg-outline-variant/20 animate-pulse" />
              )}
            </div>
            {loaded ? (
              <p className="text-[9px] uppercase font-bold tracking-widest text-secondary">
                Day Streak
              </p>
            ) : (
              <div className="h-2.5 w-14 rounded bg-outline-variant/20 animate-pulse" />
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div
              className="h-12 w-12 rounded-xl btn-primary-gradient flex items-center justify-center text-white shrink-0"
              aria-hidden
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.5,2C11.5,2 11.5,2 11.5,2C11.52,4.84 9.07,7.21 6.5,8.21C9.64,10.02 11,13.71 11,17.5C11,20.26 8.76,22.5 6,22.5C3.24,22.5 1,20.26 1,17.5C1,11 6,7 6,7C6,7 5.75,8.8 6.5,10.07C7.81,6.59 11.5,5 11.5,2M17.5,7C17.5,7 17.5,7 17.5,7C17.53,8.7 16.05,10.13 14.5,10.73C16.38,11.82 17.2,14 17.2,16.3C17.2,17.9 15.9,19.2 14.3,19.2C12.7,19.2 11.4,17.9 11.4,16.3C11.4,12.4 14.4,10 14.4,10C14.4,10 14.25,11.08 14.7,11.84C15.48,9.75 17.5,8.8 17.5,7Z" />
              </svg>
            </div>
            {loaded ? (
              <div className="min-w-0">
                <p className="font-display text-xl sm:text-3xl md:text-4xl font-extrabold text-foreground leading-none">
                  {streakDays}
                </p>
                <p className="text-[10px] md:text-xs uppercase font-bold tracking-[0.12em] text-secondary mt-1">
                  Day Streak
                </p>
              </div>
            ) : (
              <div>
                <div className="h-8 w-12 rounded bg-outline-variant/20 animate-pulse" />
                <div className="h-3 w-16 rounded bg-outline-variant/20 animate-pulse mt-2" />
              </div>
            )}
          </div>
        </div>

        {/* Daily Goal Card */}
        <div className="bg-surface-lowest rounded-[1.5rem] md:rounded-[2rem] p-3 md:p-5 shadow-[0_12px_40px_rgba(0,14,33,0.06)]">
          <div className="flex flex-col items-center text-center gap-2 p-1 md:hidden">
            <div className="flex items-center justify-center">
              {loaded ? (
                <p className="font-display text-2xl font-extrabold text-foreground leading-none">
                  {todayReviewed}
                  <span className="ml-0.5 text-sm font-bold text-secondary">
                    /{dailyGoal}
                  </span>
                </p>
              ) : (
                <div className="h-7 w-12 rounded bg-outline-variant/20 animate-pulse" />
              )}
            </div>
            {loaded ? (
              <p className="text-[9px] uppercase font-bold tracking-widest text-secondary">
                Daily Goal
              </p>
            ) : (
              <div className="h-2.5 w-14 rounded bg-outline-variant/20 animate-pulse" />
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <DailyGoalRing
              reviewed={todayReviewed}
              goal={dailyGoal}
              loaded={loaded}
              compact
              showValue={false}
            />
            {loaded ? (
              <div className="min-w-0">
                <p className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground leading-none">
                  {todayReviewed}
                  <span className="ml-1 text-sm md:text-base font-bold text-secondary">
                    / {dailyGoal}
                  </span>
                </p>
                <p className="text-[10px] md:text-xs uppercase font-bold tracking-[0.12em] text-secondary mt-1">
                  Daily Goal
                </p>
              </div>
            ) : (
              <div>
                <div className="h-8 w-14 rounded bg-outline-variant/20 animate-pulse" />
                <div className="h-3 w-16 rounded bg-outline-variant/20 animate-pulse mt-2" />
              </div>
            )}
          </div>
        </div>

        {/* Due Cards */}
        {dueCount > 0 ? (
          <Link
            href="/review"
            className="group bg-surface-lowest rounded-[1.5rem] md:rounded-[2rem] p-3 md:p-5 shadow-[0_12px_40px_rgba(0,14,33,0.06)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            aria-label={`Review ${dueCount} due cards`}
          >
            <div className="flex flex-col items-center text-center gap-2 p-1 md:hidden">
              <div className="flex items-center justify-center">
                <p className="font-display text-2xl font-extrabold text-primary leading-none">
                  {dueCount}
                </p>
              </div>
              <p className="text-[9px] uppercase font-bold tracking-widest text-secondary group-hover:text-primary transition-colors">
                Due Cards
              </p>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div
                className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"
                aria-hidden
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary leading-none">
                  {dueCount}
                </p>
                <p className="text-[10px] md:text-xs uppercase font-bold tracking-[0.12em] text-secondary group-hover:text-primary transition-colors mt-1">
                  Cards Due
                </p>
              </div>
            </div>
          </Link>
        ) : (
          <div className="bg-surface-lowest rounded-[1.5rem] md:rounded-[2rem] p-3 md:p-5 shadow-[0_12px_40px_rgba(0,14,33,0.06)]">
            <div className="flex flex-col items-center text-center gap-2 p-1 md:hidden">
              <div className="flex items-center justify-center">
                {loaded ? (
                  <p className="font-display text-2xl font-extrabold text-primary leading-none">
                    0
                  </p>
                ) : (
                  <div className="h-7 w-8 rounded bg-outline-variant/20 animate-pulse" />
                )}
              </div>
              {loaded ? (
                <p className="text-[9px] uppercase font-bold tracking-widest text-secondary">
                  Cards Due
                </p>
              ) : (
                <div className="h-2.5 w-14 rounded bg-outline-variant/20 animate-pulse" />
              )}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div
                className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center text-success shrink-0"
                aria-hidden
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              {loaded ? (
                <div className="min-w-0">
                  <p className="font-display text-xl md:text-2xl font-bold text-success leading-none">
                    All clear
                  </p>
                  <p className="text-[10px] md:text-xs uppercase font-bold tracking-[0.12em] text-secondary mt-1">
                    Caught Up
                  </p>
                </div>
              ) : (
                <div>
                  <div className="h-6 w-14 rounded bg-outline-variant/20 animate-pulse" />
                  <div className="h-3 w-16 rounded bg-outline-variant/20 animate-pulse mt-2" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 7-Day Activity — full width */}
      <div className="bg-surface-lowest rounded-[2rem] p-4 md:p-5 lg:p-6 shadow-[0_12px_40px_rgba(0,14,33,0.06)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-on-surface-variant">
            7-Day Activity
          </span>
          {loaded && (
            <span className="text-xs text-secondary">
              {weeklyReviewed} cards &middot; {weeklyMinutes} min
            </span>
          )}
        </div>
        {loaded && sevenDayActivity.length > 0 ? (
          <div className="flex items-end gap-2 md:gap-2.5 h-24">
            {sevenDayActivity.map((day, i) => {
              const barPct =
                day.reviewed > 0
                  ? Math.max((day.reviewed / maxActivity) * 100, 18)
                  : 0;
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1.5"
                >
                  <div className="w-full max-w-12 h-16 md:h-[72px] rounded-md bg-surface-low flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded-md transition-all duration-500 ${
                        day.isToday
                          ? "bg-primary"
                          : day.reviewed > 0
                            ? "bg-primary/30"
                            : "bg-outline-variant/20"
                      }`}
                      style={{
                        height: day.reviewed > 0 ? `${barPct}%` : "6px",
                      }}
                      title={`${day.label}: ${day.reviewed} card${day.reviewed !== 1 ? "s" : ""}`}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-bold leading-none ${
                      day.isToday ? "text-primary" : "text-secondary/50"
                    }`}
                  >
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : loaded ? (
          <p className="text-sm text-secondary py-4 text-center">
            No activity yet this week. Start a session to build your streak.
          </p>
        ) : (
          <div className="flex items-end gap-2 md:gap-2.5 h-24" aria-hidden>
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-16 rounded-md bg-outline-variant/20 animate-pulse"
              />
            ))}
          </div>
        )}
      </div>

      {/* Core Learning Modes (CTAs) */}
      <section aria-label="Start learning">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          {LEARNING_MODE_CARDS.map((mode) => (
            <LearningModeCard key={mode.href} mode={mode} />
          ))}
        </div>
      </section>
    </div>
  );
}
