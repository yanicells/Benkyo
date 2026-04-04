"use client";

import { useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import type { Lesson } from "@/lib/types";
import { getLessonMastery, getLessonCompletionPercent } from "@/lib/srs";

type LessonState = "locked" | "available" | "in-progress" | "completed";
const UNLOCK_THRESHOLD = 70; // % mastery required to unlock next lesson
const subscribeNoop = () => () => {};

type LessonWithState = Lesson & {
  state: LessonState;
  mastery: number;
  completion: number;
};

function computeStates(lessons: Lesson[], data: Record<string, { mastery: number; completion: number }>): LessonWithState[] {
  return lessons.map((lesson, i) => {
    const { mastery, completion } = data[lesson.id] ?? { mastery: 0, completion: 0 };
    let state: LessonState;

    if (mastery >= UNLOCK_THRESHOLD && completion === 100) {
      state = "completed";
    } else if (completion > 0) {
      state = "in-progress";
    } else {
      // Check prerequisites
      const prereqs = lesson.prerequisiteIds ?? [];
      const prereqsMet =
        prereqs.length === 0 ||
        prereqs.every((pid) => {
          const pd = data[pid];
          return pd && pd.mastery >= UNLOCK_THRESHOLD;
        });
      // First lesson is always available; others need prereqs
      state = i === 0 || prereqsMet ? "available" : "locked";
    }

    return { ...lesson, state, mastery, completion };
  });
}

const STATE_CONFIG = {
  completed: {
    ring: "border-success",
    bg: "bg-success",
    text: "text-white",
    shadow: "shadow-[0_0_0_4px_rgba(73,179,164,0.2)]",
    label: "Completed",
    labelColor: "text-success",
    badgeBg: "bg-success/10",
  },
  "in-progress": {
    ring: "border-primary",
    bg: "btn-primary-gradient",
    text: "text-white",
    shadow: "shadow-[0_0_0_4px_rgba(0,36,70,0.15)]",
    label: "In Progress",
    labelColor: "text-primary",
    badgeBg: "bg-primary/10",
  },
  available: {
    ring: "border-primary/40",
    bg: "bg-surface-lowest",
    text: "text-primary",
    shadow: "shadow-[0_4px_16px_rgba(0,36,70,0.1)]",
    label: "Start",
    labelColor: "text-primary",
    badgeBg: "bg-primary/5",
  },
  locked: {
    ring: "border-outline-variant/40",
    bg: "bg-surface-low",
    text: "text-on-surface-variant/40",
    shadow: "",
    label: "Locked",
    labelColor: "text-on-surface-variant/50",
    badgeBg: "bg-surface-low",
  },
} as const;

function DifficultyPip({ difficulty }: { difficulty?: string }) {
  const colors: Record<string, string> = {
    beginner: "bg-success",
    intermediate: "bg-primary",
    advanced: "bg-error",
  };
  if (!difficulty) return null;
  return (
    <span className={`inline-block h-1.5 w-1.5 rounded-full ${colors[difficulty] ?? "bg-secondary"}`} />
  );
}

function NodeIcon({ state }: { state: LessonState }) {
  if (state === "completed") {
    return (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (state === "locked") {
    return (
      <svg className="w-6 h-6 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    );
  }
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function PathNode({ lesson, index }: { lesson: LessonWithState; index: number }) {
  const cfg = STATE_CONFIG[lesson.state];
  const isLocked = lesson.state === "locked";
  const totalCards = lesson.subDecks.reduce((s, sd) => s + sd.cards.length, 0);

  // Zig-zag: even = left-skewed, odd = right-skewed (on mobile, it centers everything)
  const zigzag = index % 2 === 0 ? "lg:mr-auto lg:ml-16" : "lg:ml-auto lg:mr-16";

  const inner = (
    <div
      className={`group relative flex items-center gap-4 rounded-2xl border-2 p-4 transition-all duration-200 ${cfg.ring} ${isLocked ? "bg-surface-low" : "bg-surface-lowest"} ${cfg.shadow} ${!isLocked ? "hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(0,36,70,0.12)]" : "cursor-default"}`}
    >
      {/* Node circle */}
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 ${cfg.ring} ${isLocked ? "bg-surface-low" : cfg.bg} ${cfg.text} transition-transform ${!isLocked ? "group-hover:scale-105" : ""}`}
      >
        <NodeIcon state={lesson.state} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <DifficultyPip difficulty={lesson.meta?.difficulty} />
          {lesson.meta?.estimatedMinutes && !isLocked && (
            <span className="text-[10px] text-on-surface-variant">~{lesson.meta.estimatedMinutes}m</span>
          )}
        </div>
        <h3 className={`font-display text-sm font-bold leading-tight ${isLocked ? "text-on-surface-variant/40" : "text-foreground"}`}>
          {lesson.title}
        </h3>
        <p className={`text-[11px] mt-0.5 ${isLocked ? "text-on-surface-variant/30" : "text-on-surface-variant"}`}>
          {totalCards} cards · {lesson.subDecks.length} decks
        </p>

        {/* Progress bar for in-progress */}
        {lesson.state === "in-progress" && (
          <div className="mt-2">
            <div className="h-1 w-full rounded-full bg-secondary-container overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${lesson.completion}%` }}
              />
            </div>
            <p className="text-[10px] text-on-surface-variant mt-0.5">{lesson.completion}% reviewed</p>
          </div>
        )}

        {/* Mastery for completed */}
        {lesson.state === "completed" && (
          <p className="text-[10px] text-success mt-0.5 font-medium">{lesson.mastery}% mastered</p>
        )}
      </div>

      {/* State badge */}
      <div className={`shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${cfg.badgeBg} ${cfg.labelColor}`}>
        {cfg.label}
      </div>

      {/* Arrow for non-locked */}
      {!isLocked && (
        <svg className="absolute right-4 w-4 h-4 text-on-surface-variant/30 group-hover:text-primary/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </div>
  );

  return (
    <div className={`w-full max-w-md mx-auto ${zigzag}`}>
      {isLocked ? (
        inner
      ) : (
        <Link href={`/decks/${lesson.id}`} className="block">
          {inner}
        </Link>
      )}
    </div>
  );
}

function ConnectorLine({ fromState }: { fromState: LessonState }) {
  const active = fromState === "completed" || fromState === "in-progress";
  return (
    <div className="flex justify-center py-1">
      <div className={`w-0.5 h-8 rounded-full ${active ? "bg-primary/20" : "bg-outline-variant/30"}`} />
    </div>
  );
}

export function LearningPathClient({ lessons }: { lessons: Lesson[] }) {
  const cacheRef = useRef<Record<string, { mastery: number; completion: number }> | null>(null);

  const data = useSyncExternalStore(
    subscribeNoop,
    () => {
      if (cacheRef.current === null) {
        const result: Record<string, { mastery: number; completion: number }> = {};
        for (const lesson of lessons) {
          result[lesson.id] = {
            mastery: getLessonMastery(lesson),
            completion: getLessonCompletionPercent(lesson.id, lessons),
          };
        }
        cacheRef.current = result;
      }
      return cacheRef.current;
    },
    () => ({}),
  );

  const withStates = computeStates(lessons, data ?? {});
  const completedCount = withStates.filter((l) => l.state === "completed").length;
  const inProgressCount = withStates.filter((l) => l.state === "in-progress").length;

  return (
    <div className="space-y-6">
      {/* Header summary */}
      <div className="rounded-xl bg-surface-lowest p-4 shadow-[0_12px_32px_rgba(0,36,70,0.06)] flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl btn-primary-gradient">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="font-display font-bold text-foreground text-sm">Your Journey</h2>
          <p className="text-[11px] text-on-surface-variant mt-0.5">
            {completedCount}/{lessons.length} completed
            {inProgressCount > 0 && ` · ${inProgressCount} in progress`}
          </p>
          {/* Overall progress bar */}
          <div className="mt-2 h-1.5 w-full rounded-full bg-secondary-container overflow-hidden">
            <div
              className="h-full rounded-full bg-success transition-all duration-500"
              style={{ width: `${Math.round((completedCount / lessons.length) * 100)}%` }}
            />
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-2xl font-bold text-foreground">
            {Math.round((completedCount / lessons.length) * 100)}
            <span className="text-sm font-normal text-on-surface-variant">%</span>
          </p>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wide">done</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[10px] text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-success inline-block" />
          Completed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary inline-block" />
          In Progress
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-primary/40 inline-block" />
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-outline-variant/40 inline-block" />
          Locked
        </span>
        <span className="ml-auto flex items-center gap-2">
          <DifficultyPip difficulty="beginner" />
          <span>Beginner</span>
          <DifficultyPip difficulty="intermediate" />
          <span>Intermediate</span>
          <DifficultyPip difficulty="advanced" />
          <span>Advanced</span>
        </span>
      </div>

      {/* Path nodes */}
      <div className="pb-8">
        {withStates.map((lesson, i) => (
          <div key={lesson.id}>
            <PathNode lesson={lesson} index={i} />
            {i < withStates.length - 1 && <ConnectorLine fromState={lesson.state} />}
          </div>
        ))}
      </div>

      {/* Unlock info */}
      <p className="text-center text-[11px] text-on-surface-variant pb-4">
        Lessons unlock when prerequisites reach {UNLOCK_THRESHOLD}% mastery
      </p>
    </div>
  );
}
