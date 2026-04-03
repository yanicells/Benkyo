"use client";

import Link from "next/link";
import { useState } from "react";

import type { Lesson } from "@/lib/types";
import {
  getDueCards,
  getSettings,
  getStreak,
  getTodayStats,
  getLessonMastery,
} from "@/lib/srs";

type HomeClientProps = {
  lessons: Lesson[];
};

type ClientData = {
  dueCount: number;
  streakDays: number;
  todayReviewed: number;
  dailyGoal: number;
  quickStartId: string;
  quickStartTitle: string;
  quickStartMastery: number;
};

// Choose the first lesson that has mastery < 100%, or the first lesson if all 100%
function getQuickStartLesson(lessons: Lesson[]) {
  if (lessons.length === 0) return null;
  const active = lessons.find(l => getLessonMastery(l) < 100);
  return active || lessons[0];
}

function readClientData(lessons: Lesson[]): ClientData {
  const qsl = getQuickStartLesson(lessons);

  return {
    dueCount: getDueCards(lessons).length,
    streakDays: getStreak().current,
    todayReviewed: getTodayStats().reviewed,
    dailyGoal: getSettings().dailyGoal,
    quickStartId: qsl?.id ?? "lesson-4",
    quickStartTitle: qsl?.title ?? "Genki I: Unit 4",
    quickStartMastery: qsl ? getLessonMastery(qsl) : 65,
  };
}

export function HomeClient({ lessons }: HomeClientProps) {
  const [data] = useState<ClientData | null>(() => {
    if (typeof window === "undefined") return null;
    return readClientData(lessons);
  });

  const dueCount = data?.dueCount ?? 0;
  const streakDays = data?.streakDays ?? 0;
  const todayReviewed = data?.todayReviewed ?? 0;
  const dailyGoal = data?.dailyGoal ?? 20;

  const quickStartId = data?.quickStartId ?? "lesson-4";
  const quickStartTitle = data?.quickStartTitle ?? "Genki I: Unit 4";
  const quickStartMastery = data?.quickStartMastery ?? 0;

  return (
    <div className="space-y-6">
      {/* Quick Start Card */}
      <Link href={`/decks/${quickStartId}`} className="block relative overflow-hidden rounded-xl bg-surface-lowest p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
        <div className="flex items-center gap-2 mb-3 text-primary">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 3L4 14h7v7l9-11h-7V3z" />
          </svg>
          <span className="text-xs font-bold tracking-[0.2em] uppercase">Quick Start</span>
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground relative z-10 w-full truncate">
          {quickStartTitle}
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant relative z-10 max-w-[200px]">
          Continue where you left off. Total mastery: {quickStartMastery}%.
        </p>
        
        <div className="mt-6 w-3/4 h-2 rounded-full bg-secondary-container">
          <div className="h-full rounded-full bg-primary" style={{ width: `${quickStartMastery}%` }} />
        </div>
        
        <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-container relative z-10">
          Resume Lesson
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
        
        <div className="absolute -right-4 -bottom-6 text-[180px] font-bold text-surface-low selection:bg-transparent pointer-events-none opacity-50 font-display">
          道
        </div>
      </Link>

      {/* Daily Goal Card */}
      <section className="rounded-xl bg-surface-lowest p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-on-surface-variant mb-1">
          Daily Goal
        </p>
        <div className="flex items-baseline gap-1">
          <span className="font-display text-4xl font-bold text-primary">{todayReviewed}/{dailyGoal}</span>
        </div>
        <p className="text-sm text-on-surface-variant mb-4">Cards studied today</p>
        
        <div className="flex gap-1 h-6">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className={`flex-1 rounded-sm ${i < (todayReviewed / dailyGoal * 5) ? 'bg-primary' : 'bg-secondary-container opacity-50'}`} 
            />
          ))}
        </div>
        <p className="mt-3 text-[10px] uppercase tracking-[0.1em] text-on-surface-variant font-medium">
          Current Streak: {streakDays} days
        </p>
      </section>

      {/* Learning Modules Section */}
      <div className="pt-2">
        <h3 className="font-display text-xl font-bold text-primary mb-4">Learning Modules</h3>
        
        <div className="grid gap-4">
          <Link href="/decks" className="group rounded-xl bg-surface-lowest p-5 flex flex-col shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" stroke="none">
                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z" />
              </svg>
            </div>
            <h4 className="font-display font-bold text-foreground text-lg mb-2">Lesson Decks</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Structured grammar paths from N5 to N1. Master syntax through editorial content.
            </p>
            <div className="flex gap-2 mt-4 items-center">
              <span className="px-2 py-1 rounded-md bg-surface-low text-xs font-semibold text-on-surface-variant">N5</span>
              <span className="px-2 py-1 rounded-md bg-surface-low text-xs font-semibold text-on-surface-variant">N4</span>
              <span className="px-2 py-1 rounded-md bg-surface-low text-xs font-semibold text-on-surface-variant">N3</span>
              <span className="text-xs text-on-surface-variant ml-2">{lessons.length} Active Decks</span>
            </div>
          </Link>

          <Link href="/kana" className="group rounded-xl bg-surface-lowest p-5 flex flex-col shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center text-success mb-4">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <h4 className="font-display font-bold text-foreground text-lg mb-2">Kana Practice</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Perfect your Hiragana and Katakana stroke orders with interactive writing pads.
            </p>
            <div className="flex gap-2 mt-4">
              <span className="px-2 py-1 rounded-md bg-surface-low text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Hiragana</span>
              <span className="px-2 py-1 rounded-md bg-surface-low text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Katakana</span>
              <span className="px-2 py-1 rounded-md bg-secondary-container opacity-70 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Kanji</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Kanji of the day */}
      <div className="rounded-xl btn-primary-gradient p-6 text-white relative overflow-hidden shadow-lg mt-4">
        <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white/70 mb-2">
          Kanji of the Day
        </p>
        <h2 className="font-display text-3xl font-bold mb-4 flex items-center gap-3">
          Study / 習
        </h2>
        <p className="text-sm text-white/80 leading-relaxed font-light max-w-sm mb-4">
          Originally depicting a bird practicing flight over its nest. Represents the act of repetitive learning and mastery.
        </p>

        <div className="absolute right-4 bottom-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
