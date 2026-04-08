"use client";

import { useState } from "react";
import type { ReadingStoryMeta } from "@/lib/types";

type ReadingPreStudyProps = {
  meta: ReadingStoryMeta;
};

const DIFFICULTY_CONFIG = {
  beginner: { label: "Beginner", color: "text-success bg-success/10" },
  intermediate: { label: "Intermediate", color: "text-primary bg-primary/10" },
  advanced: { label: "Advanced", color: "text-error bg-error/10" },
} as const;

function SectionToggle({
  icon,
  title,
  badge,
  defaultOpen = false,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-outline-variant/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 px-6 md:px-8 py-4 md:py-5 text-left hover:bg-surface-low transition-colors group"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/8 group-hover:bg-primary/12 transition-colors">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm md:text-base font-semibold text-foreground">{title}</p>
          {badge && (
            <p className="text-xs text-on-surface-variant mt-0.5">{badge}</p>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-on-surface-variant transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 9-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-6 md:px-8 pb-6">{children}</div>}
    </div>
  );
}

export function ReadingPreStudy({ meta }: ReadingPreStudyProps) {
  const diffConfig = DIFFICULTY_CONFIG[meta.difficulty];

  return (
    <div className="mb-8 space-y-4">
      <div className="rounded-2xl border border-primary/10 bg-surface-lowest shadow-[0_8px_32px_rgba(0,36,70,0.06)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 px-6 md:px-8 py-5 md:py-6 border-b border-outline-variant/10 bg-primary/[0.03]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm md:text-base font-bold uppercase tracking-[0.15em] text-primary">
              Read this first
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${diffConfig.color}`}>
              {diffConfig.label}
            </span>
            {meta.estimatedMinutes && (
              <span className="text-xs text-on-surface-variant flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ~{meta.estimatedMinutes}m
              </span>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="px-6 md:px-8 py-6 md:py-7">
          <p className="text-base md:text-lg leading-relaxed text-on-surface-variant">
            {meta.notes}
          </p>
          {meta.tags && meta.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {meta.tags.map((tag) => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-secondary-container text-secondary font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Key points */}
        <SectionToggle
          defaultOpen
          icon={
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          title="Key points"
          badge={`${meta.cheatSheet.length} items to remember`}
        >
          <ul className="space-y-3 mt-1">
            {meta.cheatSheet.map((point, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-foreground leading-relaxed">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                  {i + 1}
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </SectionToggle>

        {/* Study tips */}
        {meta.tips && meta.tips.length > 0 && (
          <SectionToggle
            icon={
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
            title="Study tips"
            badge="Common pitfalls and tricks"
          >
            <ul className="space-y-3 mt-1">
              {meta.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground leading-relaxed">
                  <span className="mt-0.5 text-success shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </SectionToggle>
        )}
      </div>
    </div>
  );
}
