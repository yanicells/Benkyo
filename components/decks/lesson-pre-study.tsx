"use client";

import { useState } from "react";
import type { LessonMeta } from "@/lib/types";

type LessonPreStudyProps = {
  meta: LessonMeta;
};

const DIFFICULTY_CONFIG = {
  beginner: { label: "Beginner" },
  intermediate: { label: "Intermediate" },
  advanced: { label: "Advanced" },
} as const;

function SectionToggle({
  icon,
  title,
  badge,
  defaultOpen = false,
  isFirst = false,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  isFirst?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={isFirst ? "" : "border-t border-outline-variant/30"}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-surface-low md:px-8 md:py-5"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground md:text-base">
            {title}
          </p>
          {badge && (
            <p className="mt-0.5 text-xs text-on-surface-variant">{badge}</p>
          )}
        </div>
        <svg
          className={`h-5 w-5 text-on-surface-variant transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="m19 9-7 7-7-7"
          />
        </svg>
      </button>

      {open && <div className="px-6 pt-2 pb-6 md:px-8">{children}</div>}
    </div>
  );
}

export function LessonPreStudy({ meta }: LessonPreStudyProps) {
  const diffConfig = meta.difficulty
    ? DIFFICULTY_CONFIG[meta.difficulty]
    : null;
  const readFirstBadge = [
    diffConfig?.label,
    meta.estimatedMinutes ? `~${meta.estimatedMinutes}m` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mb-6 sm:mb-8">
      <div className="overflow-hidden rounded-2xl border border-primary/10 bg-surface-lowest shadow-[0_8px_32px_rgba(0,36,70,0.06)]">
        <SectionToggle
          isFirst
          defaultOpen
          icon={
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          }
          title="Read this first"
          badge={readFirstBadge || undefined}
        >
          <div className="space-y-3 text-sm leading-relaxed text-on-surface-variant">
            {meta.notes
              .split(/\n\n+/)
              .map((paragraph, i) => (
                <p key={i} className="whitespace-pre-line">
                  {paragraph.trim()}
                </p>
              ))}
          </div>
          {meta.tags && meta.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {meta.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-secondary-container px-2.5 py-1 text-xs font-medium text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </SectionToggle>

        <SectionToggle
          icon={
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
          title="Key points"
          badge={`${meta.cheatSheet.length} items to remember`}
        >
          <ul className="mt-1 space-y-3">
            {meta.cheatSheet.map((point, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm leading-relaxed text-foreground"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                  {i + 1}
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </SectionToggle>

        {meta.tips && meta.tips.length > 0 && (
          <SectionToggle
            icon={
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            }
            title="Study tips"
            badge="Common pitfalls and tricks"
          >
            <ul className="mt-1 space-y-3">
              {meta.tips.map((tip, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm leading-relaxed text-foreground"
                >
                  <span className="mt-0.5 shrink-0 text-success">
                    <svg
                      className="h-4 w-4"
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
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </SectionToggle>
        )}

        {meta.youtubeUrl && (
          <SectionToggle
            icon={
              <svg
                className="h-4 w-4 text-[#ff0000]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            }
            title="YouTube guide"
            badge="Optional video walkthrough"
          >
            <div className="aspect-video w-full overflow-hidden rounded-xl">
              <iframe
                src={meta.youtubeUrl}
                title="Lesson guide"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </SectionToggle>
        )}
      </div>
    </div>
  );
}
