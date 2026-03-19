"use client";

import Link from "next/link";
import { useState } from "react";

import type { Lesson } from "@/lib/types";
import {
  getDueCards,
  getSettings,
  getStreak,
  getTodayStats,
} from "@/lib/srs";

type HomeClientProps = {
  lessons: Lesson[];
};

type ClientData = {
  dueCount: number;
  streakDays: number;
  todayReviewed: number;
  dailyGoal: number;
};

function readClientData(lessons: Lesson[]): ClientData {
  return {
    dueCount: getDueCards(lessons).length,
    streakDays: getStreak().current,
    todayReviewed: getTodayStats().reviewed,
    dailyGoal: getSettings().dailyGoal,
  };
}

function DailyGoalRing({
  reviewed,
  goal,
}: {
  reviewed: number;
  goal: number;
}) {
  const pct = Math.min(reviewed / goal, 1);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const done = reviewed >= goal;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
          <circle
            cx={48}
            cy={48}
            r={radius}
            fill="none"
            stroke="#fce4ec"
            strokeWidth={6}
          />
          <circle
            cx={48}
            cy={48}
            r={radius}
            fill="none"
            stroke={done ? "#16a34a" : "#9f1239"}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {done ? (
            <svg
              className="h-8 w-8 text-emerald-600"
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
          ) : (
            <span className="text-lg font-bold text-slate-900">
              {reviewed}
              <span className="text-xs text-slate-500">/{goal}</span>
            </span>
          )}
        </div>
      </div>
      <p className="text-xs text-slate-600">
        {done ? "Goal reached!" : "cards today"}
      </p>
    </div>
  );
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

  return (
    <div className="space-y-6">
      {/* Daily goal & streak row */}
      <div className="flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-rose-900/10 bg-white/90 p-5">
        <DailyGoalRing reviewed={todayReviewed} goal={dailyGoal} />
        <div className="text-center">
          <p className="text-4xl font-bold text-slate-900">{streakDays}</p>
          <p className="text-xs uppercase tracking-wider text-slate-600">
            day streak
          </p>
        </div>
      </div>

      {/* Main entry cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/decks"
          className="group rounded-3xl border border-rose-900/10 bg-white/90 p-6 transition hover:-translate-y-0.5 hover:border-rose-700/30"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-rose-700">
            Study
          </p>
          <h2 className="mt-3 font-display text-3xl text-slate-900">
            Lesson decks
          </h2>
          <p className="mt-2 text-sm text-slate-700">
            Practice Genki vocab and grammar cards in flashcard or
            multiple-choice mode.
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-rose-800 transition group-hover:text-rose-900">
            Open decks
          </p>
        </Link>

        <Link
          href="/review"
          className="group relative rounded-3xl border border-rose-900/10 bg-white/90 p-6 transition hover:-translate-y-0.5 hover:border-rose-700/30"
        >
          {dueCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-700 px-1.5 text-xs font-bold text-white">
              {dueCount}
            </span>
          )}
          <p className="text-xs uppercase tracking-[0.2em] text-rose-700">
            Review
          </p>
          <h2 className="mt-3 font-display text-3xl text-slate-900">
            Due cards
          </h2>
          <p className="mt-2 text-sm text-slate-700">
            {dueCount > 0
              ? `${dueCount} cards are due for spaced repetition review.`
              : "No cards due right now. Study some decks first."}
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-rose-800 transition group-hover:text-rose-900">
            Start review
          </p>
        </Link>

        <Link
          href="/kana"
          className="group rounded-3xl border border-rose-900/10 bg-white/90 p-6 transition hover:-translate-y-0.5 hover:border-rose-700/30"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-rose-700">
            Practice
          </p>
          <h2 className="mt-3 font-display text-3xl text-slate-900">
            Kana practice
          </h2>
          <p className="mt-2 text-sm text-slate-700">
            Select hiragana or katakana groups and train romaji with strict
            character feedback.
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-rose-800 transition group-hover:text-rose-900">
            Open kana
          </p>
        </Link>
      </section>

      {/* Keyboard shortcuts */}
      <section>
        <div className="grid gap-3 sm:grid-cols-2">
          <article className="rounded-2xl border border-rose-900/10 bg-white/90 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-rose-700">
              Session keybinds
            </p>
            <div className="mt-3 space-y-1.5 text-sm text-slate-700">
              <p>
                <kbd className="rounded border border-rose-900/20 bg-rose-50 px-1.5 py-0.5 text-xs font-semibold text-rose-800">
                  Enter
                </kbd>{" "}
                or{" "}
                <kbd className="rounded border border-rose-900/20 bg-rose-50 px-1.5 py-0.5 text-xs font-semibold text-rose-800">
                  Space
                </kbd>{" "}
                to reveal / confirm
              </p>
              <p>
                <kbd className="rounded border border-rose-900/20 bg-rose-50 px-1.5 py-0.5 text-xs font-semibold text-rose-800">
                  1-4
                </kbd>{" "}
                to pick MC options or rate SRS
              </p>
            </div>
          </article>

          <article className="rounded-2xl border border-rose-900/10 bg-white/90 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-rose-700">
              SRS ratings
            </p>
            <div className="mt-3 space-y-1.5 text-sm text-slate-700">
              <p>
                <kbd className="rounded border border-rose-900/20 bg-rose-50 px-1.5 py-0.5 text-xs font-semibold text-rose-800">
                  1
                </kbd>{" "}
                Again &middot;{" "}
                <kbd className="rounded border border-rose-900/20 bg-rose-50 px-1.5 py-0.5 text-xs font-semibold text-rose-800">
                  2
                </kbd>{" "}
                Hard &middot;{" "}
                <kbd className="rounded border border-rose-900/20 bg-rose-50 px-1.5 py-0.5 text-xs font-semibold text-rose-800">
                  3
                </kbd>{" "}
                Good &middot;{" "}
                <kbd className="rounded border border-rose-900/20 bg-rose-50 px-1.5 py-0.5 text-xs font-semibold text-rose-800">
                  4
                </kbd>{" "}
                Easy
              </p>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
