"use client";

import { useState } from "react";
import type { LessonMeta } from "@/lib/types";

type LessonPreStudyProps = {
  meta: LessonMeta;
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
        className="flex w-full items-center gap-3 px-6 py-3.5 text-left hover:bg-surface-low transition-colors group"
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/8 group-hover:bg-primary/12 transition-colors">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground">{title}</p>
          {badge && (
            <p className="text-[10px] text-on-surface-variant">{badge}</p>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-on-surface-variant transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 9-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-6 pb-5">{children}</div>}
    </div>
  );
}

export function LessonPreStudy({ meta }: LessonPreStudyProps) {
  const [showVideo, setShowVideo] = useState(false);
  const diffConfig = meta.difficulty ? DIFFICULTY_CONFIG[meta.difficulty] : null;

  return (
    <div className="mb-8 space-y-4">
      <div className="rounded-2xl border border-primary/10 bg-surface-lowest shadow-[0_8px_32px_rgba(0,36,70,0.06)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-outline-variant/10 bg-primary/[0.03]">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">
              Read this first
            </p>
          </div>
          {/* Difficulty + time badges */}
          <div className="flex items-center gap-2">
            {diffConfig && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${diffConfig.color}`}>
                {diffConfig.label}
              </span>
            )}
            {meta.estimatedMinutes && (
              <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ~{meta.estimatedMinutes}m
              </span>
            )}
          </div>
        </div>

        {/* Notes — always visible */}
        <div className="px-6 py-5">
          <p className="text-sm leading-relaxed text-on-surface-variant">
            {meta.notes}
          </p>
          {meta.tags && meta.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {meta.tags.map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-container text-secondary font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Key points accordion */}
        <SectionToggle
          defaultOpen
          icon={
            <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          title="Key points"
          badge={`${meta.cheatSheet.length} items to remember`}
        >
          <ul className="space-y-2 mt-1">
            {meta.cheatSheet.map((point, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-foreground leading-snug">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-[9px] font-bold text-primary">
                  {i + 1}
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </SectionToggle>

        {/* Study tips accordion */}
        {meta.tips && meta.tips.length > 0 && (
          <SectionToggle
            icon={
              <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
            title="Study tips"
            badge="Common pitfalls and tricks"
          >
            <ul className="space-y-2 mt-1">
              {meta.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-foreground leading-snug">
                  <span className="mt-0.5 text-success">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </SectionToggle>
        )}

        {/* YouTube guide accordion */}
        {meta.youtubeUrl && (
          <div className="border-t border-outline-variant/10">
            {!showVideo ? (
              <button
                type="button"
                onClick={() => setShowVideo(true)}
                className="w-full flex items-center gap-3 px-6 py-3.5 text-left hover:bg-surface-low transition-colors group"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#ff0000]/10 group-hover:bg-[#ff0000]/15 transition-colors">
                  <svg className="w-3.5 h-3.5 text-[#ff0000]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">Watch lesson guide</p>
                  <p className="text-[10px] text-on-surface-variant">Optional video walkthrough before drilling</p>
                </div>
                <svg className="w-4 h-4 text-on-surface-variant group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => setShowVideo(false)}
                  className="w-full flex items-center gap-2 px-6 py-3 text-left hover:bg-surface-low transition-colors"
                >
                  <svg className="w-4 h-4 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  <span className="text-xs text-on-surface-variant">Hide video</span>
                </button>
                <div className="aspect-video w-full">
                  <iframe
                    src={meta.youtubeUrl}
                    title="Lesson guide"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
