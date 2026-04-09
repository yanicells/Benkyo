"use client";

import { LessonPreStudy } from "@/components/decks/lesson-pre-study";
import type { ReadingStoryMeta } from "@/lib/types";

type ReadingPreStudyProps = {
  meta: ReadingStoryMeta;
};

export function ReadingPreStudy({ meta }: ReadingPreStudyProps) {
  return (
    <LessonPreStudy
      meta={{
        notes: meta.notes,
        cheatSheet: meta.cheatSheet,
        difficulty: meta.difficulty,
        estimatedMinutes: meta.estimatedMinutes,
        tags: meta.tags,
        tips: meta.tips,
      }}
    />
  );
}
