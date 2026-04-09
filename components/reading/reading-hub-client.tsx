"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import type { ReadingDifficultyGroup } from "@/lib/types";
import {
  subscribeToReadingProgress,
  getReadingProgressRevision,
  getAllReadingProgress,
  getDifficultyStats,
} from "@/lib/reading-progress";

type ReadingHubClientProps = {
  difficulties: ReadingDifficultyGroup[];
};

const subscribeNoop = () => () => {};

const DIFFICULTY_COLORS = {
  simple: {
    badge: "bg-success/10 text-success",
    bar: "bg-success",
    iconBg: "bg-[#d1faf4]",
    iconText: "text-[#2a9a8c]",
  },
  intermediate: {
    badge: "bg-primary/10 text-primary",
    bar: "bg-primary",
    iconBg: "bg-primary/10",
    iconText: "text-primary",
  },
  hard: {
    badge: "bg-error/10 text-error",
    bar: "bg-amber-400",
    iconBg: "bg-[#fef3c7]",
    iconText: "text-[#b45309]",
  },
} as const;

function DifficultyCard({
  group,
  isHydrated,
  dataRevision,
}: {
  group: ReadingDifficultyGroup;
  isHydrated: boolean;
  dataRevision: number;
}) {
  const stats = useMemo(
    () =>
      isHydrated && dataRevision >= 0
        ? getDifficultyStats(group.stories)
        : { completed: 0, total: group.stories.length, avgScore: 0 },
    [isHydrated, dataRevision, group.stories],
  );

  const completedPct =
    stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);
  const colors = DIFFICULTY_COLORS[group.key];

  return (
    <Link
      href={`/reading/${group.key}`}
      className="group relative flex flex-col rounded-2xl bg-surface-lowest p-4 shadow-[0_4px_20px_rgba(0,14,33,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,14,33,0.1)] cursor-pointer sm:p-5"
    >
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
          {group.label}
        </span>
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${colors.iconBg} text-sm font-bold ${colors.iconText} font-japanese-display`}
        >
          {group.icon}
        </span>
      </div>

      <h2 className="mb-1 font-display text-lg font-bold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-xl">
        {group.label} Reading
      </h2>

      <p className="mb-4 text-xs leading-relaxed text-secondary">
        {group.stories.length} {group.stories.length === 1 ? "story" : "stories"}
        {stats.completed > 0 && ` · ${stats.completed} completed`}
        {stats.avgScore > 0 && ` · ${stats.avgScore}% avg`}
      </p>

      <div className="mt-auto">
        <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.12em]">
          <span className="text-on-surface-variant">Progress</span>
          <span className="text-on-surface-variant">
            <span className={colors.badge.split(" ")[1]}>
              {stats.completed}/{stats.total} completed
            </span>
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary-container overflow-hidden">
          <div
            className={`h-full rounded-full ${colors.bar} transition-all duration-500`}
            style={{ width: `${completedPct}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

export function ReadingHubClient({ difficulties }: ReadingHubClientProps) {
  const isHydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const dataRevision = useSyncExternalStore(
    subscribeToReadingProgress,
    getReadingProgressRevision,
    () => -1,
  );

  const allStories = useMemo(
    () => difficulties.flatMap((d) => d.stories),
    [difficulties],
  );

  const global = useMemo(() => {
    if (!isHydrated || dataRevision < 0)
      return { completed: 0, total: 0, avgScore: 0 };
    const all = getAllReadingProgress();
    let completed = 0;
    let totalScore = 0;
    let totalQuestions = 0;
    for (const story of allStories) {
      const progress = all[story.id];
      if (progress?.completed) {
        completed++;
        totalScore += progress.bestScore;
        totalQuestions += progress.totalQuestions;
      }
    }
    return {
      completed,
      total: allStories.length,
      avgScore:
        totalQuestions > 0
          ? Math.round((totalScore / totalQuestions) * 100)
          : 0,
    };
  }, [isHydrated, dataRevision, allStories]);

  const globalPct =
    global.total === 0
      ? 0
      : Math.round((global.completed / global.total) * 100);

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Overall progress */}
      <div className="rounded-2xl bg-surface-lowest shadow-[0_4px_20px_rgba(0,14,33,0.04)] p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-on-surface-variant">
            Overall Progress
          </p>
          <p className="text-[11px] text-on-surface-variant">
            <span className="font-semibold text-primary">
              {global.completed}/{global.total} stories
            </span>
            {global.avgScore > 0 && (
              <>
                <span className="px-1 text-on-surface-variant/40">/</span>
                <span className="font-semibold text-amber-700">
                  {global.avgScore}% avg score
                </span>
              </>
            )}
          </p>
        </div>
        <div className="h-2 rounded-full bg-secondary-container overflow-hidden mb-3">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{ width: `${globalPct}%` }}
          />
        </div>
        <p className="text-xs text-on-surface-variant">
          {global.completed === 0
            ? "Start any story to begin tracking your reading progress."
            : `${global.completed} of ${global.total} stories completed`}
        </p>
      </div>

      {/* Difficulty grid */}
      <div className="grid grid-cols-1 gap-3 [@media(min-width:520px)]:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {difficulties.map((group) => (
          <DifficultyCard
            key={group.key}
            group={group}
            isHydrated={isHydrated}
            dataRevision={dataRevision}
          />
        ))}
      </div>
    </div>
  );
}
