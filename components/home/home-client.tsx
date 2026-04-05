"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { Lesson } from "@/lib/types";
import {
  getStreak,
  getDueCards,
  getSettings,
  getTodayStats,
  getAllDailyStats,
  getLifetimeStats,
  getLessonMastery,
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
}: {
  reviewed: number;
  goal: number;
  loaded: boolean;
}) {
  const pct = loaded ? Math.min(reviewed / goal, 1) : 0;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const done = loaded && reviewed >= goal;

  return (
    <div
      className="relative flex h-24 w-24 items-center justify-center"
      role="img"
      aria-label={
        loaded
          ? `Daily goal: ${reviewed} of ${goal} cards reviewed`
          : "Daily goal loading"
      }
    >
      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
        <circle
          cx={48}
          cy={48}
          r={radius}
          fill="none"
          stroke="var(--outline-variant)"
          strokeWidth={5}
          opacity={0.3}
        />
        <circle
          cx={48}
          cy={48}
          r={radius}
          fill="none"
          stroke={done ? "var(--success)" : "var(--primary)"}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {!loaded ? (
          <span className="h-4 w-10 rounded bg-outline-variant/30 animate-pulse block" />
        ) : done ? (
          <svg
            className="h-7 w-7 text-success"
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
        ) : (
          <>
            <span className="font-display text-2xl font-extrabold text-foreground leading-none">
              {reviewed}
            </span>
            <span className="text-[10px] text-secondary mt-0.5">of {goal}</span>
          </>
        )}
      </div>
    </div>
  );
}

export function HomeClient({ lessons }: HomeClientProps) {
  const [data, setData] = useState<ClientData | null>(null);

  useEffect(() => {
    setData(readClientData(lessons));
  }, [lessons]);

  const loaded = data !== null;

  const streakDays = data?.streakDays ?? 0;
  const dueCount = data?.dueCount ?? 0;
  const todayReviewed = data?.todayReviewed ?? 0;
  const dailyGoal = data?.dailyGoal ?? 20;
  const weeklyMinutes = data?.weeklyMinutes ?? 0;
  const weeklyReviewed = data?.weeklyReviewed ?? 0;
  const sevenDayActivity = data?.sevenDayActivity ?? [];

  const maxActivity = Math.max(
    ...sevenDayActivity.map((d) => d.reviewed),
    1
  );

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8 lg:py-12 w-full flex flex-col gap-8 md:gap-12 lg:gap-14">
      {/* Page Header */}
      <header>
        <p className="text-secondary text-xs uppercase tracking-[0.2em] font-bold mb-3">
          Okaeri, Scholar
        </p>
        <h1 className="font-display font-extrabold text-4xl md:text-5xl lg:text-[4rem] text-foreground leading-none tracking-tight">
          Let&apos;s Study{" "}
          <span className="font-japanese-display italic font-light text-primary">
            日本語
          </span>
        </h1>
      </header>

      {/* Stats Cards - 3 columns */}
      <div className="grid grid-cols-3 gap-3 md:gap-5 lg:gap-6">
        {/* Streak Card */}
        <div className="bg-surface-lowest rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 lg:p-8 shadow-[0_12px_40px_rgba(0,14,33,0.06)] flex flex-col items-center justify-center text-center gap-2 md:gap-3">
          <div
            className="w-12 h-12 md:w-14 md:h-14 rounded-2xl btn-primary-gradient flex items-center justify-center text-white shrink-0"
            aria-hidden
          >
            <svg className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.5,2C11.5,2 11.5,2 11.5,2C11.52,4.84 9.07,7.21 6.5,8.21C9.64,10.02 11,13.71 11,17.5C11,20.26 8.76,22.5 6,22.5C3.24,22.5 1,20.26 1,17.5C1,11 6,7 6,7C6,7 5.75,8.8 6.5,10.07C7.81,6.59 11.5,5 11.5,2M17.5,7C17.5,7 17.5,7 17.5,7C17.53,8.7 16.05,10.13 14.5,10.73C16.38,11.82 17.2,14 17.2,16.3C17.2,17.9 15.9,19.2 14.3,19.2C12.7,19.2 11.4,17.9 11.4,16.3C11.4,12.4 14.4,10 14.4,10C14.4,10 14.25,11.08 14.7,11.84C15.48,9.75 17.5,8.8 17.5,7Z" />
            </svg>
          </div>
          {loaded ? (
            <>
              <span className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground leading-none">
                {streakDays}
              </span>
              <span className="text-[10px] md:text-xs uppercase font-bold tracking-[0.12em] text-secondary">
                Day Streak
              </span>
            </>
          ) : (
            <>
              <div className="h-8 w-12 rounded bg-outline-variant/20 animate-pulse" />
              <div className="h-3 w-16 rounded bg-outline-variant/20 animate-pulse" />
            </>
          )}
        </div>

        {/* Daily Goal Card */}
        <div className="bg-surface-lowest rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 lg:p-8 shadow-[0_12px_40px_rgba(0,14,33,0.06)] flex flex-col items-center justify-center text-center gap-1">
          <DailyGoalRing
            reviewed={todayReviewed}
            goal={dailyGoal}
            loaded={loaded}
          />
          <span className="text-[10px] md:text-xs uppercase font-bold tracking-[0.12em] text-secondary mt-1">
            Daily Goal
          </span>
        </div>

        {/* Due Cards */}
        {dueCount > 0 ? (
          <Link
            href="/review"
            className="group bg-surface-lowest rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 lg:p-8 shadow-[0_12px_40px_rgba(0,14,33,0.06)] flex flex-col items-center justify-center text-center gap-2 md:gap-3 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            aria-label={`Review ${dueCount} due cards`}
          >
            <div
              className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0"
              aria-hidden
            >
              <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary leading-none">
              {dueCount}
            </span>
            <span className="text-[10px] md:text-xs uppercase font-bold tracking-[0.12em] text-secondary group-hover:text-primary transition-colors">
              Cards Due
            </span>
          </Link>
        ) : (
          <div className="bg-surface-lowest rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 lg:p-8 shadow-[0_12px_40px_rgba(0,14,33,0.06)] flex flex-col items-center justify-center text-center gap-2 md:gap-3">
            <div
              className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-success/10 flex items-center justify-center text-success shrink-0"
              aria-hidden
            >
              <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            {loaded ? (
              <>
                <span className="font-display text-xl md:text-2xl font-bold text-success leading-none">
                  All clear
                </span>
                <span className="text-[10px] md:text-xs uppercase font-bold tracking-[0.12em] text-secondary">
                  Caught Up
                </span>
              </>
            ) : (
              <>
                <div className="h-6 w-14 rounded bg-outline-variant/20 animate-pulse" />
                <div className="h-3 w-16 rounded bg-outline-variant/20 animate-pulse" />
              </>
            )}
          </div>
        )}
      </div>

      {/* 7-Day Activity — full width */}
      <div className="bg-surface-lowest rounded-[2rem] p-5 md:p-6 lg:p-8 shadow-[0_12px_40px_rgba(0,14,33,0.06)]">
        <div className="flex items-center justify-between mb-5">
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
          <div className="flex items-end gap-2 md:gap-3" style={{ height: "80px" }}>
            {sevenDayActivity.map((day, i) => {
              const barPct =
                day.reviewed > 0
                  ? Math.max((day.reviewed / maxActivity) * 100, 15)
                  : 0;
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div
                    className="w-full flex items-end justify-center"
                    style={{ height: "60px" }}
                  >
                    <div
                      className={`w-full max-w-[48px] rounded-md transition-all duration-500 ${
                        day.isToday
                          ? "bg-primary"
                          : day.reviewed > 0
                          ? "bg-primary/30"
                          : "bg-outline-variant/20"
                      }`}
                      style={{
                        height:
                          day.reviewed > 0 ? `${barPct}%` : "4px",
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
          <p className="text-sm text-secondary py-6 text-center">
            No activity yet this week. Start a session to build your streak.
          </p>
        ) : (
          <div
            className="flex items-end gap-2 md:gap-3"
            style={{ height: "80px" }}
            aria-hidden
          >
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-8 rounded-md bg-outline-variant/20 animate-pulse"
              />
            ))}
          </div>
        )}
      </div>

      {/* Review Banner — only shown when cards are due */}
      {loaded && dueCount > 0 && (
        <Link
          href="/review"
          className="group flex items-center justify-between rounded-[2rem] btn-primary-gradient px-6 py-5 md:px-8 md:py-6 text-white shadow-[0_12px_40px_rgba(0,14,33,0.12)] hover:shadow-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label={`Review ${dueCount} due cards`}
        >
          <span className="font-display font-bold text-lg lg:text-xl">
            You have{" "}
            <span className="font-extrabold">{dueCount}</span>{" "}
            card{dueCount !== 1 ? "s" : ""} due for review
          </span>
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider shrink-0">
            Start Review
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
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
          </span>
        </Link>
      )}

      {/* Core Learning Modes (CTAs) */}
      <section aria-label="Start learning">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {/* Kana Practice */}
          <Link
            href="/kana"
            className="group rounded-[2rem] bg-surface-lowest overflow-hidden shadow-[0_12px_40px_rgba(0,14,33,0.06)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-row md:flex-col min-h-0 md:min-h-[240px] lg:min-h-[280px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Start kana practice session"
          >
            <div className="w-[30%] md:w-auto md:h-[45%] bg-[#0a0a0c] flex items-center justify-center relative overflow-hidden shrink-0">
              <span
                className="font-japanese-display text-6xl md:text-8xl text-surface-low/30 italic group-hover:scale-110 transition-transform duration-500"
                aria-hidden
              >
                ひ
              </span>
            </div>
            <div className="flex-1 p-5 md:p-6 lg:p-8 flex flex-col justify-center md:justify-start">
              <span className="inline-block px-2 py-1 bg-[#8ef4e4] text-[#2a9a8c] text-[9px] font-bold uppercase tracking-wider rounded w-fit mb-2 md:mb-3">
                FOUNDATION
              </span>
              <h3 className="font-display font-bold text-lg md:text-xl text-foreground mb-1 md:mb-2">
                Kana Practice
              </h3>
              <p className="text-xs text-secondary leading-relaxed mb-3 md:mb-4 hidden xs:block">
                Drill hiragana &amp; katakana with instant feedback.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-foreground md:mt-auto">
                Start Session
                <svg
                  className="w-4 h-4 text-primary"
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
              </div>
            </div>
          </Link>

          {/* Lesson Decks */}
          <Link
            href="/decks"
            className="group rounded-[2rem] bg-surface-lowest overflow-hidden shadow-[0_12px_40px_rgba(0,14,33,0.06)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-row md:flex-col min-h-0 md:min-h-[240px] lg:min-h-[280px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Browse lesson decks"
          >
            <div className="w-[30%] md:w-auto md:h-[45%] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative overflow-hidden shrink-0">
              <span
                className="font-japanese-display text-6xl md:text-8xl text-primary/20 group-hover:scale-110 transition-transform duration-500"
                aria-hidden
              >
                学
              </span>
            </div>
            <div className="flex-1 p-5 md:p-6 lg:p-8 flex flex-col justify-center md:justify-start">
              <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider rounded w-fit mb-2 md:mb-3">
                STUDY
              </span>
              <h3 className="font-display font-bold text-lg md:text-xl text-foreground mb-1 md:mb-2">
                Lesson Decks
              </h3>
              <p className="text-xs text-secondary leading-relaxed mb-3 md:mb-4 hidden xs:block">
                Genki vocab &amp; grammar with spaced repetition.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-foreground md:mt-auto">
                Browse Lessons
                <svg
                  className="w-4 h-4 text-primary"
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
              </div>
            </div>
          </Link>

          {/* Learning Path */}
          <Link
            href="/path"
            className="group rounded-[2rem] bg-surface-lowest overflow-hidden shadow-[0_12px_40px_rgba(0,14,33,0.06)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-row md:flex-col min-h-0 md:min-h-[240px] lg:min-h-[280px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="View learning path"
          >
            <div className="w-[30%] md:w-auto md:h-[45%] bg-gradient-to-br from-[#8ef4e4]/20 to-[#2a9a8c]/10 flex items-center justify-center relative overflow-hidden shrink-0">
              <span
                className="font-japanese-display text-6xl md:text-8xl text-[#2a9a8c]/20 group-hover:scale-110 transition-transform duration-500"
                aria-hidden
              >
                道
              </span>
            </div>
            <div className="flex-1 p-5 md:p-6 lg:p-8 flex flex-col justify-center md:justify-start">
              <span className="inline-block px-2 py-1 bg-[#8ef4e4] text-[#2a9a8c] text-[9px] font-bold uppercase tracking-wider rounded w-fit mb-2 md:mb-3">
                GUIDED
              </span>
              <h3 className="font-display font-bold text-lg md:text-xl text-foreground mb-1 md:mb-2">
                Learning Path
              </h3>
              <p className="text-xs text-secondary leading-relaxed mb-3 md:mb-4 hidden xs:block">
                Follow a structured path from beginner to fluent.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-foreground md:mt-auto">
                View Path
                <svg
                  className="w-4 h-4 text-primary"
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
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
