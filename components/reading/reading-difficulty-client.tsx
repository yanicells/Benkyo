"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import type { ReadingDifficulty, ReadingStory } from "@/lib/types";
import {
  subscribeToReadingProgress,
  getReadingProgressRevision,
  getAllReadingProgress,
} from "@/lib/reading-progress";

type ReadingDifficultyClientProps = {
  stories: ReadingStory[];
  difficulty: ReadingDifficulty;
};

const subscribeNoop = () => () => {};

function StoryCard({
  story,
  difficulty,
  index,
  isHydrated,
  dataRevision,
}: {
  story: ReadingStory;
  difficulty: ReadingDifficulty;
  index: number;
  isHydrated: boolean;
  dataRevision: number;
}) {
  const progress = useMemo(() => {
    if (!isHydrated || dataRevision < 0) return null;
    const all = getAllReadingProgress();
    return all[story.id] ?? null;
  }, [isHydrated, dataRevision, story.id]);

  return (
    <Link
      href={`/reading/${difficulty}/${story.id}`}
      className="group relative flex flex-col rounded-2xl bg-surface-lowest p-4 shadow-[0_4px_20px_rgba(0,14,33,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,14,33,0.1)] cursor-pointer sm:p-5"
    >
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
          Story {index + 1}
        </span>
        {progress?.completed && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10">
            <svg
              className="w-3.5 h-3.5 text-success"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </span>
        )}
      </div>

      <h2 className="mb-1 font-display text-lg font-bold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-xl">
        {story.title}
      </h2>

      <p className="mb-4 text-xs leading-relaxed text-secondary">
        {story.passages.length}{" "}
        {story.passages.length === 1 ? "passage" : "passages"} ·{" "}
        {story.questions.length}{" "}
        {story.questions.length === 1 ? "question" : "questions"}
        {story.meta.estimatedMinutes
          ? ` · ~${story.meta.estimatedMinutes}m`
          : ""}
      </p>

      <div className="mt-auto">
        {progress?.completed ? (
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.12em]">
            <span className="text-success">Completed</span>
            <span className="text-on-surface-variant">
              Best: {Math.round((progress.bestScore / progress.totalQuestions) * 100)}%
            </span>
          </div>
        ) : (
          <div className="flex items-center text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
            {progress ? "In progress" : "Not started"}
          </div>
        )}
      </div>
    </Link>
  );
}

export function ReadingDifficultyClient({
  stories,
  difficulty,
}: ReadingDifficultyClientProps) {
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

  return (
    <div className="grid grid-cols-1 gap-3 [@media(min-width:520px)]:grid-cols-2 sm:gap-4 lg:grid-cols-3 pb-16">
      {stories.map((story, index) => (
        <StoryCard
          key={story.id}
          story={story}
          difficulty={difficulty}
          index={index}
          isHydrated={isHydrated}
          dataRevision={dataRevision}
        />
      ))}
    </div>
  );
}
