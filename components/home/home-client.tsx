"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { Lesson } from "@/lib/types";
import {
  getStreak,
  getLessonMastery,
  getAllDailyStats,
  getLifetimeStats,
} from "@/lib/srs";

type HomeClientProps = {
  lessons: Lesson[];
};

type ClientData = {
  streakDays: number;
  quickStartId: string;
  cardsMastered: number;
  totalCards: number;
  weeklyMinutes: number;
  weeklyReviewed: number;
};

// Choose the first lesson that has mastery < 100%, or the first lesson if all 100%
function getQuickStartLesson(lessons: Lesson[]) {
  if (lessons.length === 0) return null;
  const active = lessons.find((l) => getLessonMastery(l) < 100);
  return active || lessons[0];
}

function readClientData(lessons: Lesson[]): ClientData {
  const qsl = getQuickStartLesson(lessons);
  const lifetime = getLifetimeStats(lessons);

  const allDaily = getAllDailyStats();
  const today = new Date();
  let weeklySeconds = 0;
  let weeklyReviewed = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    weeklySeconds += allDaily[key]?.timeSpentSeconds ?? 0;
    weeklyReviewed += allDaily[key]?.reviewed ?? 0;
  }

  return {
    streakDays: getStreak().current,
    quickStartId: qsl?.id ?? lessons[0]?.id ?? "",
    cardsMastered: lifetime.mastered,
    totalCards: lifetime.totalCards,
    weeklyMinutes: Math.round(weeklySeconds / 60),
    weeklyReviewed,
  };
}

export function HomeClient({ lessons }: HomeClientProps) {
  const fallbackQuickStartId = lessons[0]?.id ?? "";
  const [data, setData] = useState<ClientData>({
    streakDays: 0,
    quickStartId: fallbackQuickStartId,
    cardsMastered: 0,
    totalCards: 0,
    weeklyMinutes: 0,
    weeklyReviewed: 0,
  });

  useEffect(() => {
    setData(readClientData(lessons));
  }, [lessons]);

  const streakDays = data?.streakDays ?? 0;
  const quickStartId = data?.quickStartId ?? fallbackQuickStartId;
  const cardsMastered = data?.cardsMastered ?? 0;
  const totalCards = data?.totalCards ?? 0;
  const weeklyMinutes = data?.weeklyMinutes ?? 0;
  const weeklyReviewed = data?.weeklyReviewed ?? 0;
  const masteryRate =
    totalCards > 0 ? Math.round((cardsMastered / totalCards) * 100) : 0;
  const quickStartHref = quickStartId ? `/decks/${quickStartId}` : "/decks";

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8 lg:py-12 w-full flex flex-col gap-10 lg:gap-14">
      {/* Page Header */}
      <header>
        <p className="text-secondary text-xs uppercase tracking-[0.2em] font-bold mb-3">
          Good morning, scholar.
        </p>
        <h1 className="font-display font-extrabold text-5xl lg:text-[4rem] text-foreground leading-none tracking-tight">
          Today&apos;s{" "}
          <span className="font-japanese-display italic font-light text-primary">
            Mindfulness.
          </span>
        </h1>
      </header>

      {/* Top Grid: Main Interactive + Streak */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        {/* Left: Learning / Study Card */}
        <Link
          href={quickStartHref}
          className="lg:col-span-8 group relative bg-surface-lowest overflow-hidden rounded-[2rem] p-8 lg:p-12 shadow-[0_12px_40px_rgba(0,14,33,0.06)] hover:shadow-[0_16px_48px_rgba(0,14,33,0.08)] transition-all duration-300"
        >
          <p className="text-primary text-[10px] uppercase font-bold tracking-[0.2em] mb-4">
            Daily Kanji
          </p>
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            Learning / Study
          </h2>

          <p className="max-w-sm text-base text-on-surface-variant leading-relaxed mb-10 mr-4 md:mr-0 z-10 relative">
            The character 学 depicts a roof over a child, symbolizing the
            sheltered environment of a classroom.
          </p>

          <div className="flex gap-3 mb-10 z-10 relative">
            <div className="bg-surface-low rounded-xl p-3 flex flex-col min-w-[120px]">
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">
                On-Yomi
              </span>
              <span className="font-bold text-foreground">GAKU (ガク)</span>
            </div>
            <div className="bg-surface-low rounded-xl p-3 flex flex-col min-w-[120px]">
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">
                Kun-Yomi
              </span>
              <span className="font-bold text-foreground">
                Mana-bu (まなぶ)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-bold text-sm text-primary group-hover:text-primary/80 transition-colors z-10 relative">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            Watch Stroke Order
          </div>

          {/* Huge Kanji background */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 font-display text-[220px] md:text-[340px] leading-none text-surface-low font-bold pointer-events-none select-none z-0 transform group-hover:scale-105 transition-transform duration-700 ease-out">
            学
          </div>
          {/* Highlight Kanji Overlay (Asymmetric overlay as shown in design) */}
          <div className="hidden lg:block absolute right-[10%] top-1/2 -translate-y-[45%] font-display text-[180px] leading-none text-primary font-bold pointer-events-none select-none z-10">
            学
          </div>
        </Link>

        {/* Right: Streak Card */}
        <div className="lg:col-span-4 bg-surface-lowest rounded-[2rem] p-8 lg:p-10 shadow-[0_12px_40px_rgba(0,14,33,0.06)] flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-secondary text-[10px] uppercase font-bold tracking-[0.2em] mb-2">
                Current Streak
              </p>
              <h3 className="font-display text-4xl font-extrabold text-foreground">
                {streakDays} Days
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl btn-primary-gradient flex items-center justify-center text-white shadow-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.5,2C11.5,2 11.5,2 11.5,2C11.52,4.84 9.07,7.21 6.5,8.21C9.64,10.02 11,13.71 11,17.5C11,20.26 8.76,22.5 6,22.5C3.24,22.5 1,20.26 1,17.5C1,11 6,7 6,7C6,7 5.75,8.8 6.5,10.07C7.81,6.59 11.5,5 11.5,2M17.5,7C17.5,7 17.5,7 17.5,7C17.53,8.7 16.05,10.13 14.5,10.73C16.38,11.82 17.2,14 17.2,16.3C17.2,17.9 15.9,19.2 14.3,19.2C12.7,19.2 11.4,17.9 11.4,16.3C11.4,12.4 14.4,10 14.4,10C14.4,10 14.25,11.08 14.7,11.84C15.48,9.75 17.5,8.8 17.5,7Z" />
              </svg>
            </div>
          </div>

          <div className="mt-8 mb-8 space-y-3 rounded-xl bg-surface-low p-4 border border-outline-variant/20">
            <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant uppercase tracking-[0.12em]">
              <span>This Week</span>
              <span>{weeklyMinutes} min focused</span>
            </div>
            <div className="flex items-center justify-between text-sm text-secondary">
              <span>Cards reviewed</span>
              <span className="font-bold text-foreground">
                {weeklyReviewed}
              </span>
            </div>
          </div>

          <p className="text-sm text-secondary font-medium leading-relaxed">
            Consistency compounds. Keep your streak alive with one focused
            session today.
          </p>
        </div>
      </div>

      {/* Recommended Lessons Grid */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Recommended Lessons
          </h2>
          <Link
            href="/decks"
            className="text-[10px] uppercase font-bold tracking-[0.2em] text-secondary hover:text-primary transition-colors"
          >
            VIEW ALL
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          {/* Card 1 */}
          <Link
            href="/kana"
            className="group rounded-[2rem] bg-surface-lowest overflow-hidden shadow-[0_12px_40px_rgba(0,14,33,0.06)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex"
          >
            <div className="w-[40%] bg-[#0a0a0c] flex items-center justify-center p-8 relative overflow-hidden">
              <span className="font-japanese-display text-8xl text-surface-low/30 italic group-hover:scale-110 transition-transform duration-500">
                ひ
              </span>
            </div>
            <div className="w-[60%] p-8 flex flex-col justify-center">
              <span className="inline-block px-2 py-1 bg-[#8ef4e4] text-[#2a9a8c] text-[9px] font-bold uppercase tracking-wider rounded w-fit mb-3">
                FOUNDATION
              </span>
              <h3 className="font-display font-bold text-xl text-foreground mb-2">
                Hiragana Mastery
              </h3>
              <p className="text-xs text-secondary leading-relaxed mb-6">
                Polishing the nuance of cursive phonetics through stroke
                pressure.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-foreground">
                Start Session
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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

          {/* Card 2 */}
          <Link
            href="/decks"
            className="group rounded-[2rem] bg-surface-lowest overflow-hidden shadow-[0_12px_40px_rgba(0,14,33,0.06)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex"
          >
            <div
              className="w-[40%] bg-surface flex items-center justify-center relative overflow-hidden bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1544257143-6c7025816fd8?q=80&w=600&auto=format&fit=crop')",
              }}
            >
              {/* Fallback image style using css gradient if unavailable */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black mix-blend-multiply opacity-80"></div>
              <span className="font-japanese-display text-8xl text-white/50 relative z-10 group-hover:scale-110 transition-transform duration-500">
                に
              </span>
            </div>
            <div className="w-[60%] p-8 flex flex-col justify-center relative">
              <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider rounded w-fit mb-3">
                GRAMMAR
              </span>
              <h3 className="font-display font-bold text-xl text-foreground mb-2">
                Particle Ni Basics
              </h3>
              <p className="text-xs text-secondary leading-relaxed mb-6">
                Understanding directional intent and static location markers.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-foreground">
                Start Session
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </div>
              {/* Quick Add Button absolute right bottom */}
              <div className="absolute right-0 bottom-0 w-14 h-14 bg-primary text-white rounded-tl-2xl flex items-center justify-center hover:bg-primary-container transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Stats Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 pt-4">
        <div className="bg-surface-lowest rounded-[1.5rem] p-6 shadow-sm flex items-center justify-center gap-6">
          <div className="w-12 h-12 rounded-full bg-surface-low border border-outline-variant/30 flex items-center justify-center text-secondary">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
              <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
            </svg>
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold tracking-[0.15em] text-secondary mb-1">
              Focus Time
            </p>
            <p className="font-display text-2xl font-bold text-foreground">
              {weeklyMinutes}{" "}
              <span className="text-secondary text-sm font-normal">
                min / wk
              </span>
            </p>
          </div>
        </div>

        <div className="bg-surface-lowest rounded-[1.5rem] p-6 shadow-sm flex items-center justify-center gap-6">
          <div className="w-12 h-12 rounded-full bg-surface-low border border-outline-variant/30 flex items-center justify-center text-secondary">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-.95zM21 19c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05v11.45z" />
            </svg>
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold tracking-[0.15em] text-secondary mb-1">
              Cards Mastered
            </p>
            <p className="font-display text-2xl font-bold text-foreground">
              {cardsMastered}{" "}
              <span className="text-secondary text-sm font-normal">
                / {totalCards}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-surface-lowest rounded-[1.5rem] p-6 shadow-sm flex items-center justify-center gap-6">
          <div className="w-12 h-12 rounded-full bg-surface-low border border-outline-variant/30 flex items-center justify-center text-secondary">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold tracking-[0.15em] text-secondary mb-1">
              Mastery Rate
            </p>
            <p className="font-display text-2xl font-bold text-foreground">
              {masteryRate}%
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
