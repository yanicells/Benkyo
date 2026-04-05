"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { Lesson } from "@/lib/types";
import { useAuth } from "@/components/shared/auth-provider";
import { signIn, signOut } from "@/lib/auth-client";
import { PageShell } from "@/components/shared/page-shell";
import {
  getLifetimeStats,
  getStreak,
  getTodayStats,
  getDueCards,
  getLessonMastery,
} from "@/lib/srs";

const subscribeNoop = () => () => {};

type LocalStats = {
  lifetime: ReturnType<typeof getLifetimeStats>;
  streak: ReturnType<typeof getStreak>;
  today: ReturnType<typeof getTodayStats>;
  dueCount: number;
};

function LessonRow({ lesson }: { lesson: Lesson }) {
  const mastery = getLessonMastery(lesson);
  const totalCards = lesson.subDecks.reduce((s, sd) => s + sd.cards.length, 0);
  const diffColors: Record<string, string> = {
    beginner: "text-success",
    intermediate: "text-primary",
    advanced: "text-error",
  };
  const diffBg: Record<string, string> = {
    beginner: "bg-success/8",
    intermediate: "bg-primary/8",
    advanced: "bg-error/8",
  };
  const diff = lesson.meta?.difficulty;
  const isMastered = mastery >= 70;

  return (
    <div className="flex items-center gap-4 py-3.5 group">
      {/* Mastery ring */}
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90 h-11 w-11" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r="18" fill="none" stroke="var(--secondary-container)" strokeWidth="3" />
          <circle
            cx="22" cy="22" r="18" fill="none"
            stroke={isMastered ? "var(--success)" : "var(--primary)"}
            strokeWidth="3"
            strokeDasharray={`${(mastery / 100) * 113.1} 113.1`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        </svg>
        <span className="text-[9px] font-bold text-foreground">{mastery}%</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-foreground truncate leading-tight">{lesson.title}</p>
          {diff && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${diffColors[diff] ?? ""} ${diffBg[diff] ?? ""}`}>
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-secondary-container overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isMastered ? "bg-success" : "bg-primary"}`}
              style={{ width: `${mastery}%` }}
            />
          </div>
          <span className="text-[10px] text-on-surface-variant shrink-0">{totalCards} cards</span>
        </div>
      </div>
    </div>
  );
}

function InstallCard() {
  return (
    <Link
      href="/install"
      className="group rounded-[1.5rem] bg-surface-lowest p-6 border border-outline-variant/20 hover:bg-surface-low hover:-translate-y-0.5 transition-all duration-200 shadow-[0_12px_40px_rgba(0,14,33,0.06)] relative overflow-hidden block"
    >
      <span
        className="absolute right-3 top-1/2 -translate-y-1/2 font-japanese-display text-[80px] leading-none text-surface-low font-bold pointer-events-none select-none"
        aria-hidden
      >
        得
      </span>
      <div className="relative flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/8 shrink-0">
          <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Install Benkyo</p>
          <p className="text-[11px] text-on-surface-variant mt-0.5">
            Add to home screen for offline access
          </p>
        </div>
        <svg className="w-4 h-4 text-on-surface-variant/40 ml-auto shrink-0 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

export function ProfileClient({ lessons }: { lessons: Lesson[] }) {
  const { isSignedIn, user, syncState, triggerSync } = useAuth();
  const cacheRef = useRef<LocalStats | null>(null);
  const [isStandalone] = useState(() => {
    if (typeof window === "undefined") return true;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true
    );
  });

  const stats = useSyncExternalStore(
    subscribeNoop,
    () => {
      if (!cacheRef.current) {
        cacheRef.current = {
          lifetime: getLifetimeStats(lessons),
          streak: getStreak(),
          today: getTodayStats(),
          dueCount: getDueCards(lessons).length,
        };
      }
      return cacheRef.current;
    },
    () => null,
  );

  const lifetime = stats?.lifetime ?? { totalReviews: 0, mastered: 0, totalCards: 0, totalCorrect: 0 };
  const streak = stats?.streak ?? { current: 0, lastDate: "" };
  const today = stats?.today ?? { reviewed: 0, correct: 0, timeSpentSeconds: 0 };
  const dueCount = stats?.dueCount ?? 0;
  const overallAccuracy = lifetime.totalReviews > 0
    ? Math.round((lifetime.totalCorrect / lifetime.totalReviews) * 100)
    : 0;
  const masteryPct = lifetime.totalCards > 0
    ? Math.round((lifetime.mastered / lifetime.totalCards) * 100)
    : 0;
  const initial = user?.name?.charAt(0).toUpperCase() ?? "?";

  // Signed-out state
  if (!isSignedIn) {
    return (
      <PageShell eyebrow="Account" title="Profile">
        <div className="space-y-4">
          {/* Sign-in card */}
          <div className="rounded-[2rem] bg-surface-lowest shadow-[0_12px_40px_rgba(0,14,33,0.06)] p-8 relative overflow-hidden">
            {/* Decorative kanji */}
            <span className="absolute right-6 top-1/2 -translate-y-1/2 font-japanese-display text-[120px] leading-none text-surface-low font-bold pointer-events-none select-none" aria-hidden>
              人
            </span>
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-low border border-outline-variant/20 mb-6">
                <svg className="h-8 w-8 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Sign in to sync</h2>
              <p className="text-sm text-on-surface-variant mb-6 leading-relaxed max-w-sm">
                Your study progress is saved locally on this device. Sign in to back it up and access it anywhere.
              </p>
              <button
                type="button"
                onClick={() => signIn.social({ provider: "google", callbackURL: "/profile" })}
                className="flex items-center gap-3 rounded-xl border border-outline-variant/40 bg-surface-low px-5 py-3 text-sm font-semibold text-foreground hover:bg-secondary-container transition-colors"
              >
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
              <p className="mt-4 text-[11px] text-on-surface-variant">
                The app works fully without an account
              </p>
            </div>
          </div>

          {/* Local stats teaser */}
          {lifetime.totalReviews > 0 && (
            <div className="rounded-[2rem] bg-surface-lowest shadow-[0_12px_40px_rgba(0,14,33,0.06)] p-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold mb-5">
                Your local progress
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="font-display text-3xl font-bold text-primary">{lifetime.totalReviews}</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">Reviews</p>
                </div>
                <div>
                  <p className="font-display text-3xl font-bold text-success">{lifetime.mastered}</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">Mastered</p>
                </div>
                <div>
                  <p className="font-display text-3xl font-bold text-primary">{streak.current}</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">Day streak</p>
                </div>
              </div>
            </div>
          )}

          {/* Install app */}
          {!isStandalone && <InstallCard />}
        </div>
      </PageShell>
    );
  }

  // Signed-in state
  return (
    <PageShell eyebrow="Account" title="Profile">
      <div className="space-y-5">

        {/* ── User identity card ── */}
        <div className="rounded-[2rem] bg-surface-lowest shadow-[0_12px_40px_rgba(0,14,33,0.06)] p-8 relative overflow-hidden">
          {/* Decorative kanji watermark */}
          <span className="absolute right-6 top-1/2 -translate-y-1/2 font-japanese-display text-[160px] leading-none text-surface-low font-bold pointer-events-none select-none" aria-hidden>
            学
          </span>

          <div className="relative flex items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name}
                  className="h-20 w-20 rounded-2xl ring-2 ring-primary/10 shadow-[0_8px_24px_rgba(0,0,0,0.1)]"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl btn-primary-gradient shadow-[0_8px_24px_rgba(0,36,70,0.2)]">
                  <span className="font-display text-4xl font-bold text-white">{initial}</span>
                </div>
              )}
              {streak.current > 0 && (
                <div className="absolute -bottom-2 -right-2 flex items-center gap-0.5 rounded-full bg-success px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                  🔥 {streak.current}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-display text-2xl font-bold text-foreground leading-tight truncate">
                {user?.name}
              </h2>
              <p className="text-sm text-on-surface-variant truncate mt-0.5">{user?.email}</p>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-low border border-outline-variant/20 px-3 py-1 text-[11px] font-semibold text-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-success inline-block" />
                  {masteryPct >= 80 ? "Advanced" : masteryPct >= 40 ? "Intermediate" : "Beginner"}
                </span>
                {dueCount > 0 && (
                  <span className="inline-flex items-center rounded-full bg-primary/8 px-3 py-1 text-[11px] font-semibold text-primary">
                    {dueCount} cards due
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { value: lifetime.totalReviews, label: "Total Reviews", sub: "all time", color: "text-primary" },
            { value: `${streak.current}d`, label: "Streak", sub: streak.lastDate ? `last: ${streak.lastDate}` : "start today", color: "text-success" },
            { value: `${masteryPct}%`, label: "Mastered", sub: `${lifetime.mastered} / ${lifetime.totalCards} cards`, color: "text-primary" },
            { value: lifetime.totalReviews > 0 ? `${overallAccuracy}%` : "—", label: "Accuracy", sub: "lifetime", color: "text-secondary" },
          ].map(({ value, label, sub, color }) => (
            <div key={label} className="rounded-[1.5rem] bg-surface-lowest shadow-[0_12px_40px_rgba(0,14,33,0.06)] p-5 flex flex-col gap-1">
              <p className={`font-display text-3xl font-bold ${color}`}>{value}</p>
              <p className="text-[10px] font-bold text-foreground uppercase tracking-wider mt-0.5">{label}</p>
              {sub && <p className="text-[10px] text-on-surface-variant">{sub}</p>}
            </div>
          ))}
        </div>

        {/* ── Today strip ── */}
        {today.reviewed > 0 && (
          <div className="rounded-2xl bg-primary px-6 py-4 flex items-center justify-between">
            <p className="text-xs font-bold text-white/60 uppercase tracking-wider">Today</p>
            <div className="flex items-center gap-4 text-sm text-white flex-wrap justify-end">
              <span><span className="font-bold">{today.reviewed}</span> reviewed</span>
              <span className="text-white/25">·</span>
              <span><span className="font-bold">{today.correct}</span> correct</span>
              {today.reviewed > 0 && (
                <>
                  <span className="text-white/25">·</span>
                  <span className="font-bold text-success">
                    {Math.round((today.correct / today.reviewed) * 100)}%
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Quick actions ── */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/review"
            className="group rounded-[1.5rem] btn-primary-gradient p-6 shadow-[0_12px_40px_rgba(0,14,33,0.15)] hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden"
          >
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-japanese-display text-[80px] leading-none text-white/[0.07] font-bold pointer-events-none select-none" aria-hidden>復</span>
            <div className="relative">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1.5">Ready</p>
              <p className="font-display text-3xl font-bold text-white">{dueCount}</p>
              <p className="text-[11px] text-white/60 mt-1">cards due</p>
            </div>
          </Link>
          <Link
            href="/stats"
            className="group rounded-[1.5rem] bg-surface-lowest p-6 border border-outline-variant/20 hover:bg-surface-low hover:-translate-y-0.5 transition-all duration-200 shadow-[0_12px_40px_rgba(0,14,33,0.06)] relative overflow-hidden"
          >
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-japanese-display text-[80px] leading-none text-surface-low font-bold pointer-events-none select-none" aria-hidden>績</span>
            <div className="relative">
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Analytics</p>
              <p className="font-display text-3xl font-bold text-foreground">Stats</p>
              <p className="text-[11px] text-on-surface-variant mt-1">View charts</p>
            </div>
          </Link>
        </div>

        {/* ── Install app ── */}
        {!isStandalone && <InstallCard />}

        {/* ── Sync card ── */}
        <div className="rounded-[1.5rem] bg-surface-lowest shadow-[0_12px_40px_rgba(0,14,13,0.06)] p-6">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Sync</p>
            <span className="flex items-center gap-1.5 text-[11px] text-success font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-success inline-block" />
              Connected
            </span>
          </div>
          <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">
            Progress syncs automatically. Click below to push your latest local data to the cloud.
          </p>
          <button
            type="button"
            onClick={() => void triggerSync()}
            disabled={syncState === "syncing"}
            className="w-full rounded-xl bg-surface-low py-2.5 text-sm font-semibold text-primary hover:bg-secondary-container transition-colors disabled:opacity-50"
          >
            {syncState === "syncing" ? "Syncing…" : syncState === "done" ? "Synced ✓" : "Sync now"}
          </button>
        </div>

        {/* ── Lesson mastery ── */}
        <div className="rounded-[1.5rem] bg-surface-lowest shadow-[0_12px_40px_rgba(0,14,13,0.06)] p-6">
          <div className="mb-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold mb-1">
              Lesson Mastery
            </p>
            <p className="text-sm text-on-surface-variant">
              Mastery = cards with interval ≥ 21 days
            </p>
          </div>
          <div className="divide-y divide-outline-variant/10">
            {lessons.map((lesson) => (
              <LessonRow key={lesson.id} lesson={lesson} />
            ))}
          </div>
        </div>

        {/* ── Sign out ── */}
        <div className="flex justify-center pb-2">
          <button
            type="button"
            onClick={() => void signOut()}
            className="text-xs text-on-surface-variant hover:text-foreground transition-colors py-2 px-5 rounded-xl hover:bg-surface-low"
          >
            Sign out
          </button>
        </div>

      </div>
    </PageShell>
  );
}
