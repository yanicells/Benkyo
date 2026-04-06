"use client";

import { useMemo, useSyncExternalStore } from "react";

import type { Lesson } from "@/lib/types";
import {
  getAllSRS,
  makeCardId,
  subscribeToStudyData,
  getStudyDataRevision,
} from "@/lib/srs";

type LessonProgressOverviewProps = {
  lesson: Lesson;
};

function computeLessonProgress(lesson: Lesson) {
  const all = getAllSRS();
  let total = 0;
  let reviewed = 0;
  let mastered = 0;

  for (const subDeck of lesson.subDecks) {
    for (let i = 0; i < subDeck.cards.length; i++) {
      total++;
      const srs = all[makeCardId(subDeck.id, i)];
      if (!srs) continue;
      if (srs.totalReviews > 0) reviewed++;
      if (srs.interval >= 21) mastered++;
    }
  }

  const reviewedPct = total === 0 ? 0 : Math.round((reviewed / total) * 100);
  const masteryPct = total === 0 ? 0 : Math.round((mastered / total) * 100);

  return { total, reviewed, mastered, reviewedPct, masteryPct };
}

export function LessonProgressOverview({
  lesson,
}: LessonProgressOverviewProps) {
  const dataRevision = useSyncExternalStore(
    subscribeToStudyData,
    getStudyDataRevision,
    () => -1,
  );

  const progress = useMemo(
    () => (dataRevision < 0 ? null : computeLessonProgress(lesson)),
    [lesson, dataRevision],
  );

  const reviewedPct = progress?.reviewedPct ?? 0;
  const masteryPct = progress?.masteryPct ?? 0;
  const reviewed = progress?.reviewed ?? 0;
  const mastered = progress?.mastered ?? 0;
  const total =
    progress?.total ??
    lesson.subDecks.reduce((sum, sd) => sum + sd.cards.length, 0);

  return (
    <div className="mb-6 rounded-2xl bg-surface-lowest p-5 shadow-[0_8px_28px_rgba(0,36,70,0.06)]">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
          Lesson Progress
        </p>
        <p className="text-[10px] text-on-surface-variant">{total} cards</p>
      </div>

      <div className="space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-primary">Mastery</span>
            <span className="text-on-surface-variant">
              {mastered}/{total} ({masteryPct}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary-container overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${masteryPct}%` }}
            />
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-amber-700">Reviewed</span>
            <span className="text-on-surface-variant">
              {reviewed}/{total} ({reviewedPct}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary-container overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-400 transition-all duration-500"
              style={{ width: `${reviewedPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
