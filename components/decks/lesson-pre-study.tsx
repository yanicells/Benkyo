"use client";

import { useState } from "react";
import type { LessonMeta } from "@/lib/types";

type LessonPreStudyProps = {
  meta: LessonMeta;
};

export function LessonPreStudy({ meta }: LessonPreStudyProps) {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="mb-8 space-y-4">
      {/* Read this first panel */}
      <div className="rounded-2xl border border-primary/10 bg-surface-lowest shadow-[0_8px_32px_rgba(0,36,70,0.06)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-outline-variant/10 bg-primary/[0.03]">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">
              Read this first
            </p>
          </div>
        </div>

        <div className="px-6 py-5 grid gap-6 lg:grid-cols-[1fr_auto]">
          {/* Notes */}
          <div>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              {meta.notes}
            </p>
          </div>

          {/* Cheat sheet */}
          <div className="lg:border-l lg:border-outline-variant/10 lg:pl-6 lg:min-w-[280px]">
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-secondary mb-3">
              Key points
            </p>
            <ul className="space-y-2">
              {meta.cheatSheet.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-foreground leading-snug">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-[9px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* YouTube guide toggle */}
        {meta.youtubeUrl && (
          <div className="border-t border-outline-variant/10">
            {!showVideo ? (
              <button
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
