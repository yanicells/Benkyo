"use client";

import Link from "next/link";
import { useState } from "react";

import type { Lesson } from "@/lib/types";
import { getLessonMastery, getAllSRS, makeCardId } from "@/lib/srs";

type LessonDeckGridProps = {
  lessons: Lesson[];
};

const DIFFICULTY_COLORS = {
  beginner: { badge: "bg-success/10 text-success", bar: "bg-success" },
  intermediate: { badge: "bg-primary/10 text-primary", bar: "bg-primary" },
  advanced: { badge: "bg-error/10 text-error", bar: "bg-error" },
} as const;

function LessonCard({ lesson, index }: { lesson: Lesson; index: number }) {
  const [mastery] = useState(() => {
    if (typeof window === "undefined") return 0;
    return getLessonMastery(lesson);
  });

  const totalCards = lesson.subDecks.reduce(
    (sum, sd) => sum + sd.cards.length,
    0,
  );

  const diff = lesson.meta?.difficulty;
  const diffStyle = diff ? DIFFICULTY_COLORS[diff] : null;
  const isMastered = mastery >= 70;

  return (
    <Link
      href={`/decks/${lesson.id}`}
      className="group relative flex flex-col rounded-2xl bg-surface-lowest p-5 shadow-[0_4px_20px_rgba(0,14,33,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,14,33,0.1)] cursor-pointer"
    >
      {/* Top row: level badge + difficulty */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
          Lesson {index + 1}
        </span>
        {diffStyle && diff && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${diffStyle.badge}`}>
            {diff.charAt(0).toUpperCase() + diff.slice(1)}
          </span>
        )}
      </div>

      {/* Title */}
      <h2 className="font-display text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors mb-1">
        {lesson.title}
      </h2>

      {/* Meta */}
      <p className="text-xs text-on-surface-variant mb-4">
        {lesson.subDecks.length} sub-deck{lesson.subDecks.length !== 1 ? "s" : ""} · {totalCards} cards
        {lesson.meta?.estimatedMinutes ? ` · ~${lesson.meta.estimatedMinutes}m` : ""}
      </p>

      {/* Progress */}
      <div className="mt-auto">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
          <span className="text-on-surface-variant">Mastery</span>
          <span className={isMastered ? "text-success" : "text-primary"}>{mastery}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary-container overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isMastered ? "bg-success" : "bg-primary"}`}
            style={{ width: `${mastery}%` }}
          />
        </div>
      </div>

      {/* Arrow */}
      <div className="absolute top-5 right-5 flex h-7 w-7 items-center justify-center rounded-lg bg-surface-low text-on-surface-variant group-hover:bg-primary group-hover:text-white transition-all">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

function useGlobalMastery(lessons: Lesson[]) {
  return useState(() => {
    if (typeof window === "undefined") return { percent: 0, reviewed: 0, mastered: 0, total: 0 };
    const all = getAllSRS();
    let total = 0;
    let mastered = 0;
    let reviewed = 0;
    for (const lesson of lessons) {
      for (const sd of lesson.subDecks) {
        for (let i = 0; i < sd.cards.length; i++) {
          total++;
          const srs = all[makeCardId(sd.id, i)];
          if (srs) {
            if (srs.totalReviews > 0) reviewed++;
            if (srs.interval >= 21) mastered++;
          }
        }
      }
    }
    return {
      percent: total === 0 ? 0 : Math.round((mastered / total) * 100),
      reviewed,
      mastered,
      total,
    };
  })[0];
}

export function LessonDeckGrid({ lessons }: LessonDeckGridProps) {
  const global = useGlobalMastery(lessons);

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Overall mastery overview */}
      <div className="rounded-2xl bg-surface-lowest shadow-[0_4px_20px_rgba(0,14,33,0.04)] p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-on-surface-variant">
            Overall Mastery
          </p>
          <span className="font-display text-2xl font-extrabold text-primary">
            {global.reviewed === 0 ? "—" : `${global.percent}%`}
          </span>
        </div>
        <div className="h-2 rounded-full bg-secondary-container overflow-hidden mb-3">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{ width: `${global.percent}%` }}
          />
        </div>
        <p className="text-xs text-on-surface-variant">
          {global.reviewed === 0
            ? "Start any lesson to begin tracking your progress."
            : `${global.mastered} of ${global.total} cards mastered · ${global.reviewed} studied`}
        </p>
      </div>

      {/* Lesson grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lessons.map((lesson, index) => (
          <LessonCard key={lesson.id} lesson={lesson} index={index} />
        ))}
      </div>
    </div>
  );
}
