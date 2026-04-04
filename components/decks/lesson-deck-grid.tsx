"use client";

import Link from "next/link";
import { useState } from "react";

import type { Lesson } from "@/lib/types";
import { getLessonMastery, getAllSRS, makeCardId } from "@/lib/srs";

type LessonDeckGridProps = {
  lessons: Lesson[];
};

function getDecorativeStrings(title: string) {
  if (title.toLowerCase().includes("number"))
    return { kanji: "数字", romaji: "(Sūji)" };
  if (title.toLowerCase().includes("greeting"))
    return { kanji: "挨拶", romaji: "(Aisatsu)" };
  if (title.toLowerCase().includes("verb"))
    return { kanji: "動詞", romaji: "(Dōshi)" };
  return { kanji: "語彙", romaji: "(Goi)" };
}

function LessonCard({ lesson, index }: { lesson: Lesson; index: number }) {
  const [mastery] = useState(() => {
    if (typeof window === "undefined") return 0;
    return getLessonMastery(lesson);
  });

  const totalCards = lesson.subDecks.reduce(
    (sum, sd) => sum + sd.cards.length,
    0,
  );
  const deco = getDecorativeStrings(lesson.title);

  return (
    <Link
      href={`/decks/${lesson.id}`}
      className="relative group overflow-hidden rounded-[1.5rem] bg-surface-lowest p-6 shadow-[0_4px_20px_rgba(0,14,33,0.03)] transition duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer"
    >
      <div className="flex gap-2 mb-4">
        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-[10px] font-bold text-primary uppercase tracking-wider">
          Level {index + 1}
        </span>
        <span className="px-2 py-0.5 rounded-md bg-success/10 text-[10px] font-bold text-success uppercase tracking-wider">
          Core
        </span>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-display text-xl lg:text-2xl font-bold text-foreground transition-colors group-hover:text-primary">
            {lesson.title}
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant flex items-baseline gap-1">
            <span className="font-japanese-display">{deco.kanji}</span>{" "}
            <span>{deco.romaji}</span>
          </p>
        </div>

        {index === 0 && (
          <div className="flex flex-col gap-1 items-end opacity-20 group-hover:opacity-40 transition-opacity">
            <div className="w-8 h-1 bg-primary rounded-full"></div>
            <div className="w-12 h-1 bg-primary rounded-full"></div>
            <div className="w-6 h-1 bg-primary rounded-full"></div>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-on-surface-variant line-clamp-2">
        Master essential vocabulary and structures for{" "}
        {lesson.title.toLowerCase()}. Total {totalCards} cards.
      </p>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div className="flex-1 max-w-[120px]">
          <div className="flex items-center justify-between text-[9px] uppercase tracking-wider font-bold text-foreground mb-1.5">
            <span>Mastery</span>
            <span className="text-primary">{mastery}%</span>
          </div>
          <div className="h-1 rounded-sm bg-secondary-container">
            <div
              className="h-full rounded-sm bg-primary transition-all duration-500"
              style={{ width: `${mastery}%` }}
            />
          </div>
        </div>

        <div className="inline-flex items-center justify-center rounded-lg bg-surface-low w-8 h-8 text-foreground transition group-hover:bg-primary group-hover:text-white">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}

function useGlobalMastery(lessons: Lesson[]) {
  return useState(() => {
    if (typeof window === "undefined") return { percent: 0, reviewed: 0, total: 0 };
    const all = getAllSRS();
    let total = 0;
    let mastered = 0;
    let reviewed = 0;
    for (const lesson of lessons) {
      for (const sd of lesson.subDecks) {
        for (let i = 0; i < sd.cards.length; i++) {
          total++;
          const srs = all[makeCardId(sd.id, i)];
          if (srs) {
            if (srs.totalReviews > 0) reviewed++;
            if (srs.interval >= 21) mastered++;
          }
        }
      }
    }
    return {
      percent: total === 0 ? 0 : Math.round((mastered / total) * 100),
      reviewed,
      total,
    };
  })[0];
}

function useGrammarMastery(lessons: Lesson[]) {
  return useState(() => {
    if (typeof window === "undefined") return { percent: 0, total: 0 };
    const all = getAllSRS();
    let total = 0;
    let mastered = 0;
    for (const lesson of lessons) {
      for (const sd of lesson.subDecks) {
        for (let i = 0; i < sd.cards.length; i++) {
          const card = sd.cards[i];
          if (card.type === "grammar" || card.type === "conjugation" || card.type === "fill-in") {
            total++;
            const srs = all[makeCardId(sd.id, i)];
            if (srs && srs.interval >= 21) mastered++;
          }
        }
      }
    }
    return {
      percent: total === 0 ? 0 : Math.round((mastered / total) * 100),
      total,
    };
  })[0];
}

export function LessonDeckGrid({ lessons }: LessonDeckGridProps) {
  const global = useGlobalMastery(lessons);
  const grammar = useGrammarMastery(lessons);

  const globalLabel = global.reviewed === 0
    ? "Not started"
    : `${global.percent}%`;

  return (
    <div className="flex flex-col gap-8 lg:gap-10 w-full pb-16">
      {/* Editorial Dashboard Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">

        {/* Hiragana */}
        <Link
          href="/kana?tab=hiragana"
          className="lg:col-span-6 bg-surface-lowest rounded-4xl p-8 lg:p-10 shadow-[0_12px_40px_rgba(0,14,33,0.06)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden group flex flex-col justify-between min-h-65"
        >
          <div className="flex justify-between items-start mb-6">
            <span className="font-japanese-display text-5xl text-surface-low opacity-60">
              あ
            </span>
            <div className="w-10 h-10 rounded-xl bg-surface-low flex items-center justify-center text-foreground group-hover:text-primary transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="font-display text-3xl font-bold text-foreground mb-4">
              Hiragana
            </h3>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1.5 bg-surface-low rounded-lg text-[10px] font-semibold text-secondary">
                46 Characters
              </span>
              <span className="px-3 py-1.5 bg-surface-low rounded-lg text-[10px] font-semibold text-secondary">
                Introductory
              </span>
              <span className="px-3 py-1.5 bg-surface-low rounded-lg text-[10px] font-semibold text-on-surface-variant">
                Practice →
              </span>
            </div>
          </div>
        </Link>

        {/* Katakana */}
        <Link
          href="/kana?tab=katakana"
          className="lg:col-span-6 bg-surface-lowest rounded-4xl p-8 lg:p-10 shadow-[0_12px_40px_rgba(0,14,33,0.06)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden group flex flex-col justify-between min-h-65"
        >
          <div className="flex justify-between items-start mb-6">
            <span className="font-japanese-display text-5xl text-surface-low opacity-60">
              ア
            </span>
            <div className="w-10 h-10 rounded-xl bg-surface-low flex items-center justify-center text-foreground group-hover:text-primary transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="font-display text-3xl font-bold text-foreground mb-4">
              Katakana
            </h3>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1.5 bg-surface-low rounded-lg text-[10px] font-semibold text-secondary">
                46 Characters
              </span>
              <span className="px-3 py-1.5 bg-surface-low rounded-lg text-[10px] font-semibold text-secondary">
                Loanwords
              </span>
              <span className="px-3 py-1.5 bg-surface-low rounded-lg text-[10px] font-semibold text-on-surface-variant">
                Practice →
              </span>
            </div>
          </div>
        </Link>

        {/* Kanji / Vocabulary Mastery (Full width) */}
        <div className="lg:col-span-12 bg-surface-lowest rounded-4xl p-8 lg:p-10 shadow-[0_12px_40px_rgba(0,14,33,0.06)] flex flex-col lg:flex-row gap-10 items-center">
          <div className="lg:w-[40%] text-left w-full">
            <span className="font-japanese-display text-6xl text-surface-low opacity-60 mb-2 inline-block">
              語
            </span>
            <h3 className="font-display text-3xl font-bold text-foreground mb-4">
              Vocabulary Mastery
            </h3>
            <p className="text-sm text-secondary leading-relaxed max-w-sm mb-6">
              Across all lessons and card types. A card is mastered when its review interval reaches 21+ days.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-3xl font-extrabold text-foreground">
                  {globalLabel}
                </span>
                {global.reviewed > 0 && (
                  <span className="text-xs text-secondary">mastered</span>
                )}
              </div>
              {global.reviewed > 0 && (
                <span className="text-xs text-on-surface-variant">
                  {global.reviewed} of {global.total} cards studied
                </span>
              )}
            </div>
            {global.reviewed === 0 && (
              <p className="mt-2 text-xs text-on-surface-variant">
                Start any lesson below to begin tracking progress.
              </p>
            )}
          </div>

          <div className="lg:w-[60%] w-full flex flex-col justify-center">
            <div className="flex items-end justify-between text-[10px] uppercase font-bold tracking-wider text-secondary mb-4">
              <span>Overall Progress</span>
              <span className="text-xl text-foreground font-display font-extrabold tracking-normal">
                {global.reviewed === 0 ? "—" : `${global.percent}%`}
              </span>
            </div>

            {/* Global mastery bar */}
            <div className="h-2 rounded-full bg-secondary-container mb-8">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${global.percent}%` }}
              />
            </div>

            {/* Per-lesson mastery mini bars */}
            <div className="flex gap-2 w-full">
              {lessons.slice(0, 5).map((lesson, i) => {
                const colors = [
                  "border-primary/60",
                  "border-primary/50",
                  "border-secondary/40",
                  "border-secondary/30",
                  "border-outline-variant/30",
                ];
                const opacities = ["", "", "opacity-70", "opacity-50", "opacity-40"];
                return (
                  <div
                    key={lesson.id}
                    className={`flex-1 min-w-0 bg-surface-low rounded-xl p-2 sm:p-3 flex flex-col items-center justify-center border-b-2 ${colors[i]} ${opacities[i]}`}
                  >
                    <span className="text-[9px] font-bold text-foreground uppercase mb-1 tracking-wider truncate w-full text-center">
                      {lesson.title.replace("Lesson ", "L").replace(":.*", "").split(":")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Grammar Block */}
        <Link
          href="/decks"
          className="lg:col-span-4 bg-surface-lowest rounded-4xl p-8 lg:p-10 shadow-[0_12px_40px_rgba(0,14,33,0.06)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-8">
            <span className="font-japanese-display text-5xl text-surface-low opacity-60">
              文
            </span>
            <div className="w-10 h-10 rounded-xl bg-surface-low flex items-center justify-center text-foreground group-hover:text-primary transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="font-display text-3xl font-bold text-foreground mb-3">
              Grammar
            </h3>
            {grammar.total > 0 ? (
              <div className="mb-4">
                <div className="flex items-center justify-between text-[9px] uppercase tracking-wider font-bold text-secondary mb-1.5">
                  <span>Mastery</span>
                  <span className="text-foreground">{grammar.percent}%</span>
                </div>
                <div className="h-1 rounded-sm bg-secondary-container">
                  <div
                    className="h-full rounded-sm bg-primary transition-all duration-500"
                    style={{ width: `${grammar.percent}%` }}
                  />
                </div>
                <p className="mt-2 text-[10px] text-on-surface-variant">
                  {grammar.total} grammar, conjugation & fill-in cards
                </p>
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant mb-4">
                No grammar cards studied yet.
              </p>
            )}
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1.5 bg-surface-low rounded-lg text-[9px] font-semibold text-secondary uppercase tracking-wider">
                Particles
              </span>
              <span className="px-3 py-1.5 bg-surface-low rounded-lg text-[9px] font-semibold text-secondary uppercase tracking-wider">
                Verb Conjugation
              </span>
            </div>
          </div>
        </Link>

        {/* Decorative Quote Block — CSS-only, no external image */}
        <div className="lg:col-span-8 rounded-4xl p-8 lg:p-10 relative overflow-hidden group flex flex-col justify-end min-h-75"
          style={{
            background: "linear-gradient(135deg, #0a0a0c 0%, #0f1923 40%, #0d1f2d 70%, #0a0a0c 100%)",
          }}
        >
          {/* Geometric texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                #fff 0px,
                #fff 1px,
                transparent 1px,
                transparent 40px
              ), repeating-linear-gradient(
                -45deg,
                #fff 0px,
                #fff 1px,
                transparent 1px,
                transparent 40px
              )`,
            }}
          />
          {/* Radial glow */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: "radial-gradient(ellipse at 30% 60%, rgba(142,244,228,0.3) 0%, transparent 60%)",
            }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />

          <div className="relative z-10">
            <h4 className="font-japanese-display text-3xl md:text-5xl text-white/90 mb-3 drop-shadow-lg italic font-light">
              「継続は力なり」
            </h4>
            <p className="font-display text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-[#8ef4e4] drop-shadow-md">
              Continuity is strength.
            </p>
          </div>
        </div>
      </section>

      {/* Structured Modules */}
      <section className="mt-10">
        <h3 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          Available Modules
          <span className="px-2 py-0.5 rounded-md bg-surface-low text-xs font-semibold text-secondary tracking-widest uppercase">
            Select carefully
          </span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson, index) => (
            <LessonCard key={lesson.id} lesson={lesson} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
