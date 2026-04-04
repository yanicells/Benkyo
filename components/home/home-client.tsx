"use client";

import Link from "next/link";
import { useState } from "react";

import type { Lesson, Card } from "@/lib/types";
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

type HeroCard = {
  displayChar: string;
  labelTop: string;
  title: string;
  description: string;
  reading: string | null;
  meaning: string;
  href: string;
  ctaLabel: string;
  titleIsJapanese: boolean;
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
  hero: HeroCard;
  quickStartId: string;
};

function hasJapanese(text: string): boolean {
  return /[\u3040-\u9FFF]/.test(text);
}

function getHeroCard(
  lessons: Lesson[],
  dueCards: ReturnType<typeof getDueCards>
): HeroCard {
  let card: Card | null = null;
  let href = "/review";
  let labelTop = "Due for Review";
  let ctaLabel = "Start Review";

  // Prefer a due card with Japanese in the front
  for (const dueCard of dueCards) {
    if (hasJapanese(dueCard.card.front)) {
      card = dueCard.card;
      href = "/review";
      labelTop = dueCard.lessonTitle;
      ctaLabel = "Start Review";
      break;
    }
  }

  // Fall back to first Japanese card in any lesson
  if (!card) {
    outer: for (const lesson of lessons) {
      for (const subDeck of lesson.subDecks) {
        for (const c of subDeck.cards) {
          if (hasJapanese(c.front)) {
            card = c;
            href = `/decks/${lesson.id}`;
            labelTop = lesson.title;
            ctaLabel = "Study Now";
            break outer;
          }
        }
      }
    }
  }

  if (!card) {
    return {
      displayChar: "文",
      labelTop: "Study",
      title: "Start Learning",
      description: "Build your Japanese vocabulary with spaced repetition.",
      reading: null,
      meaning: "Begin your Japanese study journey.",
      href: "/decks",
      ctaLabel: "Browse Lessons",
      titleIsJapanese: false,
    };
  }

  const displayChar = [...card.front][0] ?? "文";
  const shortDesc =
    card.back.length > 120 ? card.back.slice(0, 120) + "…" : card.back;
  const shortMeaning =
    card.back.length > 60 ? card.back.slice(0, 60) + "…" : card.back;

  return {
    displayChar,
    labelTop,
    title: card.front,
    description: shortDesc,
    reading: card.romaji || null,
    meaning: shortMeaning,
    href,
    ctaLabel,
    titleIsJapanese: hasJapanese(card.front),
  };
}

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
    hero: getHeroCard(lessons, dueCards),
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
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const done = loaded && reviewed >= goal;

  return (
    <div
      className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center"
      role="img"
      aria-label={
        loaded
          ? `Daily goal: ${reviewed} of ${goal} cards reviewed`
          : "Daily goal loading"
      }
    >
      <svg className="h-[4.5rem] w-[4.5rem] -rotate-90" viewBox="0 0 80 80">
        <circle
          cx={40}
          cy={40}
          r={radius}
          fill="none"
          stroke="var(--outline-variant)"
          strokeWidth={6}
        />
        <circle
          cx={40}
          cy={40}
          r={radius}
          fill="none"
          stroke={done ? "var(--success)" : "var(--primary)"}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {!loaded ? (
          <span className="h-3 w-8 rounded bg-outline-variant/30 animate-pulse block" />
        ) : done ? (
          <svg
            className="h-5 w-5 text-success"
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
          <span className="text-sm font-bold text-foreground leading-none">
            {reviewed}
            <span className="text-[9px] text-secondary">/{goal}</span>
          </span>
        )}
      </div>
    </div>
  );
}

export function HomeClient({ lessons }: HomeClientProps) {
  const [data] = useState<ClientData | null>(() => {
    if (typeof window === "undefined") return null;
    return readClientData(lessons);
  });
  const loaded = data !== null;

  const streakDays = data?.streakDays ?? 0;
  const dueCount = data?.dueCount ?? 0;
  const todayReviewed = data?.todayReviewed ?? 0;
  const dailyGoal = data?.dailyGoal ?? 20;
  const weeklyMinutes = data?.weeklyMinutes ?? 0;
  const weeklyReviewed = data?.weeklyReviewed ?? 0;
  const sevenDayActivity = data?.sevenDayActivity ?? [];
  const cardsMastered = data?.cardsMastered ?? 0;
  const totalCards = data?.totalCards ?? 0;
  const masteryRate =
    totalCards > 0 ? Math.round((cardsMastered / totalCards) * 100) : 0;
  const quickStartId = data?.quickStartId ?? lessons[0]?.id ?? "";
  const hero = data?.hero;

  const maxActivity = Math.max(
    ...sevenDayActivity.map((d) => d.reviewed),
    1
  );

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8 lg:py-12 w-full flex flex-col gap-10 lg:gap-14">
      {/* Page Header — English text uses display font; Japanese word uses Japanese display font */}
      <header>
        <p className="text-secondary text-xs uppercase tracking-[0.2em] font-bold mb-3">
          Okaeri, Scholar
        </p>
        <h1 className="font-display font-extrabold text-5xl lg:text-[4rem] text-foreground leading-none tracking-tight">
          Let&apos;s Study{" "}
          <span className="font-japanese-display italic font-light text-primary">
            日本語
          </span>
        </h1>
      </header>

      {/* Top Grid: Hero Card + Daily Goal / Streak */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        {/* Left: Hero Study Card */}
        <Link
          href={hero?.href ?? "/decks"}
          className="lg:col-span-8 group relative bg-surface-lowest overflow-hidden rounded-[2rem] p-8 lg:p-12 shadow-[0_12px_40px_rgba(0,14,33,0.06)] hover:shadow-[0_16px_48px_rgba(0,14,33,0.08)] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          aria-label={
            loaded
              ? `${hero?.ctaLabel ?? "Study"}: ${hero?.title ?? ""}`
              : "Loading study card"
          }
        >
          {/* Eyebrow label */}
          <p className="text-primary text-[10px] uppercase font-bold tracking-[0.2em] mb-4 min-h-[1rem]">
            {loaded ? (
              hero?.labelTop ?? "Study"
            ) : (
              <span className="inline-block h-3 w-24 rounded bg-primary/20 animate-pulse" />
            )}
          </p>

          {/* Card title — use Japanese display font only when the text is Japanese */}
          {loaded ? (
            <h2
              className={`text-3xl font-bold text-foreground mb-4 ${
                hero?.titleIsJapanese
                  ? "font-japanese-display"
                  : "font-display"
              }`}
            >
              {hero?.title ?? "Start Learning"}
            </h2>
          ) : (
            <div className="h-8 w-56 rounded-lg bg-outline-variant/20 animate-pulse mb-4" />
          )}

          {/* Description */}
          {loaded ? (
            <p className="max-w-sm text-base text-on-surface-variant leading-relaxed mb-10 mr-4 md:mr-0 z-10 relative line-clamp-3">
              {hero?.description ??
                "Browse lessons and start building your vocabulary."}
            </p>
          ) : (
            <div className="space-y-2 mb-10 max-w-sm z-10 relative">
              <div className="h-4 w-full rounded bg-outline-variant/20 animate-pulse" />
              <div className="h-4 w-4/5 rounded bg-outline-variant/20 animate-pulse" />
              <div className="h-4 w-3/5 rounded bg-outline-variant/20 animate-pulse" />
            </div>
          )}

          {/* Reading / Meaning chips */}
          {loaded ? (
            (hero?.reading || hero?.meaning) && (
              <div className="flex flex-wrap gap-3 mb-10 z-10 relative">
                {hero.reading && (
                  <div className="bg-surface-low rounded-xl p-3 flex flex-col min-w-[120px]">
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">
                      Reading
                    </span>
                    <span className="font-bold text-foreground">
                      {hero.reading}
                    </span>
                  </div>
                )}
                {hero.meaning && (
                  <div className="bg-surface-low rounded-xl p-3 flex flex-col min-w-[120px] max-w-[240px]">
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">
                      Meaning
                    </span>
                    <span className="font-bold text-foreground text-sm leading-snug">
                      {hero.meaning}
                    </span>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="flex gap-3 mb-10 z-10 relative">
              <div className="h-16 w-28 rounded-xl bg-outline-variant/15 animate-pulse" />
              <div className="h-16 w-32 rounded-xl bg-outline-variant/15 animate-pulse" />
            </div>
          )}

          {/* CTA — label matches actual behavior */}
          <div className="flex items-center gap-2 font-bold text-sm text-primary group-hover:text-primary/80 transition-colors z-10 relative">
            <svg
              className="w-5 h-5"
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
            {hero?.ctaLabel ?? "Study Now"}
          </div>

          {/* Big background character — only for Japanese text, aria-hidden */}
          {hero?.displayChar && (
            <>
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 font-japanese-display text-[220px] md:text-[340px] leading-none text-surface-low font-bold pointer-events-none select-none z-0 transform group-hover:scale-105 transition-transform duration-700 ease-out"
                aria-hidden
              >
                {hero.displayChar}
              </div>
              <div
                className="hidden lg:block absolute right-[10%] top-1/2 -translate-y-[45%] font-japanese-display text-[180px] leading-none text-primary font-bold pointer-events-none select-none z-10"
                aria-hidden
              >
                {hero.displayChar}
              </div>
            </>
          )}
        </Link>

        {/* Right: Daily Goal + Streak + 7-day activity */}
        <div className="lg:col-span-4 bg-surface-lowest rounded-[2rem] p-8 lg:p-10 shadow-[0_12px_40px_rgba(0,14,33,0.06)] flex flex-col gap-6 relative overflow-hidden">
          {/* Goal ring + streak count */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-secondary text-[10px] uppercase font-bold tracking-[0.2em]">
                Daily Goal
              </p>
              <DailyGoalRing
                reviewed={todayReviewed}
                goal={dailyGoal}
                loaded={loaded}
              />
              <p className="text-[10px] text-secondary h-4">
                {loaded
                  ? todayReviewed >= dailyGoal
                    ? "Goal reached!"
                    : "cards today"
                  : ""}
              </p>
            </div>

            <div className="text-right">
              <p className="text-secondary text-[10px] uppercase font-bold tracking-[0.2em] mb-2">
                Streak
              </p>
              {loaded ? (
                <h3 className="font-display text-4xl font-extrabold text-foreground">
                  {streakDays}
                  <span className="text-xl font-semibold text-secondary ml-1">
                    d
                  </span>
                </h3>
              ) : (
                <div className="h-10 w-20 rounded-lg bg-outline-variant/20 animate-pulse" />
              )}
              <div
                className="w-10 h-10 mt-3 rounded-xl btn-primary-gradient flex items-center justify-center text-white shadow-lg ml-auto"
                aria-hidden
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.5,2C11.5,2 11.5,2 11.5,2C11.52,4.84 9.07,7.21 6.5,8.21C9.64,10.02 11,13.71 11,17.5C11,20.26 8.76,22.5 6,22.5C3.24,22.5 1,20.26 1,17.5C1,11 6,7 6,7C6,7 5.75,8.8 6.5,10.07C7.81,6.59 11.5,5 11.5,2M17.5,7C17.5,7 17.5,7 17.5,7C17.53,8.7 16.05,10.13 14.5,10.73C16.38,11.82 17.2,14 17.2,16.3C17.2,17.9 15.9,19.2 14.3,19.2C12.7,19.2 11.4,17.9 11.4,16.3C11.4,12.4 14.4,10 14.4,10C14.4,10 14.25,11.08 14.7,11.84C15.48,9.75 17.5,8.8 17.5,7Z" />
                </svg>
              </div>
            </div>
          </div>

          {/* 7-day activity bars — real data, no hardcoded values */}
          <div className="rounded-xl bg-surface-low p-4 border border-outline-variant/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
                7-Day Activity
              </span>
              {loaded && (
                <span className="text-[10px] text-secondary">
                  {weeklyReviewed} cards this week
                </span>
              )}
            </div>
            {loaded && sevenDayActivity.length > 0 ? (
              <div className="flex items-end gap-1" style={{ height: "44px" }}>
                {sevenDayActivity.map((day, i) => {
                  const barPct =
                    day.reviewed > 0
                      ? Math.max((day.reviewed / maxActivity) * 100, 18)
                      : 0;
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div
                        className="w-full flex items-end justify-center"
                        style={{ height: "32px" }}
                      >
                        <div
                          className={`w-full rounded-sm transition-all duration-500 ${
                            day.isToday
                              ? "bg-primary"
                              : day.reviewed > 0
                              ? "bg-primary/40"
                              : "bg-outline-variant/30"
                          }`}
                          style={{
                            height:
                              day.reviewed > 0 ? `${barPct}%` : "3px",
                          }}
                          title={`${day.label}: ${day.reviewed} card${day.reviewed !== 1 ? "s" : ""}`}
                        />
                      </div>
                      <span
                        className={`text-[8px] font-bold leading-none ${
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
              <p className="text-xs text-secondary py-2 text-center">
                No activity yet this week.
              </p>
            ) : (
              <div
                className="flex items-end gap-1"
                style={{ height: "44px" }}
                aria-hidden
              >
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-5 rounded-sm bg-outline-variant/20 animate-pulse"
                  />
                ))}
              </div>
            )}
          </div>

          <p className="text-sm text-secondary font-medium leading-relaxed">
            {loaded ? (
              weeklyMinutes > 0 ? (
                `${weeklyMinutes} min focused this week. Keep it up.`
              ) : (
                "No sessions recorded this week yet."
              )
            ) : (
              <span className="inline-block h-3 w-44 rounded bg-outline-variant/20 animate-pulse" />
            )}
          </p>
        </div>
      </div>

      {/* Quick Start section */}
      <section aria-label="Quick start">
        <div className="flex justify-between items-end mb-6">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Quick Start
          </h2>
          <Link
            href="/decks"
            className="text-[10px] uppercase font-bold tracking-[0.2em] text-secondary hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            VIEW ALL
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          {/* Kana Practice Card */}
          <Link
            href="/kana"
            className="group rounded-[2rem] bg-surface-lowest overflow-hidden shadow-[0_12px_40px_rgba(0,14,33,0.06)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex min-h-[160px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Start kana practice session"
          >
            <div className="w-[40%] bg-[#0a0a0c] flex items-center justify-center p-8 relative overflow-hidden">
              <span
                className="font-japanese-display text-8xl text-surface-low/30 italic group-hover:scale-110 transition-transform duration-500"
                aria-hidden
              >
                ひ
              </span>
            </div>
            <div className="w-[60%] p-8 flex flex-col justify-center">
              <span className="inline-block px-2 py-1 bg-[#8ef4e4] text-[#2a9a8c] text-[9px] font-bold uppercase tracking-wider rounded w-fit mb-3">
                FOUNDATION
              </span>
              <h3 className="font-display font-bold text-xl text-foreground mb-2">
                Kana Practice
              </h3>
              <p className="text-xs text-secondary leading-relaxed mb-6">
                Drill hiragana and katakana groups with immediate character
                feedback.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-foreground">
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

          {/* Review / Deck card — routes to /review if cards due, otherwise quick-start lesson */}
          <Link
            href={
              dueCount > 0
                ? "/review"
                : quickStartId
                ? `/decks/${quickStartId}`
                : "/decks"
            }
            className="group relative rounded-[2rem] bg-surface-lowest overflow-hidden shadow-[0_12px_40px_rgba(0,14,33,0.06)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex min-h-[160px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={
              dueCount > 0
                ? `Review ${dueCount} due card${dueCount !== 1 ? "s" : ""}`
                : "Open lesson deck"
            }
          >
            {/* Due count badge — only when there are due cards */}
            {loaded && dueCount > 0 && (
              <span
                className="absolute right-4 top-4 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-white shadow-sm z-10"
                aria-label={`${dueCount} cards due`}
              >
                {dueCount}
              </span>
            )}
            <div className="w-[40%] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-8 relative overflow-hidden">
              <span
                className="font-japanese-display text-8xl text-primary/20 group-hover:scale-110 transition-transform duration-500"
                aria-hidden
              >
                {dueCount > 0 ? "復" : "学"}
              </span>
            </div>
            <div className="w-[60%] p-8 flex flex-col justify-center">
              <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider rounded w-fit mb-3">
                {dueCount > 0 ? "DUE" : "STUDY"}
              </span>
              <h3 className="font-display font-bold text-xl text-foreground mb-2">
                {dueCount > 0 ? "Review Cards" : "Lesson Decks"}
              </h3>
              <p className="text-xs text-secondary leading-relaxed mb-6">
                {!loaded ? (
                  <span className="inline-block h-3 w-full rounded bg-outline-variant/20 animate-pulse" />
                ) : dueCount > 0 ? (
                  `${dueCount} card${dueCount !== 1 ? "s" : ""} ready for spaced repetition review.`
                ) : (
                  "Practice Genki vocab and grammar with flashcards."
                )}
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-foreground">
                {dueCount > 0 ? "Start Review" : "Open Decks"}
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

      {/* Stats Row */}
      <section
        className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 pt-4"
        aria-label="Study statistics"
      >
        <div className="bg-surface-lowest rounded-[1.5rem] p-6 shadow-sm flex items-center justify-center gap-6">
          <div
            className="w-12 h-12 rounded-full bg-surface-low border border-outline-variant/30 flex items-center justify-center text-secondary shrink-0"
            aria-hidden
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
              <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
            </svg>
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold tracking-[0.15em] text-secondary mb-1">
              Focus Time
            </p>
            {loaded ? (
              <p className="font-display text-2xl font-bold text-foreground">
                {weeklyMinutes}{" "}
                <span className="text-secondary text-sm font-normal">
                  min / wk
                </span>
              </p>
            ) : (
              <div className="h-7 w-20 rounded bg-outline-variant/20 animate-pulse" />
            )}
          </div>
        </div>

        <div className="bg-surface-lowest rounded-[1.5rem] p-6 shadow-sm flex items-center justify-center gap-6">
          <div
            className="w-12 h-12 rounded-full bg-surface-low border border-outline-variant/30 flex items-center justify-center text-secondary shrink-0"
            aria-hidden
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-.95zM21 19c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05v11.45z" />
            </svg>
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold tracking-[0.15em] text-secondary mb-1">
              Cards Mastered
            </p>
            {loaded ? (
              <p className="font-display text-2xl font-bold text-foreground">
                {cardsMastered}{" "}
                <span className="text-secondary text-sm font-normal">
                  / {totalCards}
                </span>
              </p>
            ) : (
              <div className="h-7 w-24 rounded bg-outline-variant/20 animate-pulse" />
            )}
          </div>
        </div>

        <div className="bg-surface-lowest rounded-[1.5rem] p-6 shadow-sm flex items-center justify-center gap-6">
          <div
            className="w-12 h-12 rounded-full bg-surface-low border border-outline-variant/30 flex items-center justify-center text-secondary shrink-0"
            aria-hidden
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold tracking-[0.15em] text-secondary mb-1">
              Mastery Rate
            </p>
            {loaded ? (
              <p className="font-display text-2xl font-bold text-foreground">
                {masteryRate}%
              </p>
            ) : (
              <div className="h-7 w-16 rounded bg-outline-variant/20 animate-pulse" />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
