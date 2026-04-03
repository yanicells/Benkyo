"use client";

import Link from "next/link";
import { useState } from "react";

import type { Lesson } from "@/lib/types";
import { getLessonMastery } from "@/lib/srs";

type LessonDeckGridProps = {
  lessons: Lesson[];
};

// Hardcoded imagery/data mapped roughly for demo purposes depending on the lesson title
function getDecorativeStrings(title: string) {
  if (title.toLowerCase().includes("number")) return { kanji: "数字", romaji: "(Sūji)" };
  if (title.toLowerCase().includes("greeting")) return { kanji: "挨拶", romaji: "(Aisatsu)" };
  if (title.toLowerCase().includes("verb")) return { kanji: "動詞", romaji: "(Dōshi)" };
  return { kanji: "語彙", romaji: "(Goi)" };
}

function LessonCard({ lesson, index }: { lesson: Lesson, index: number }) {
  const [mastery] = useState(() => {
    if (typeof window === "undefined") return 0;
    return getLessonMastery(lesson);
  });

  const totalCards = lesson.subDecks.reduce((sum, sd) => sum + sd.cards.length, 0);
  const deco = getDecorativeStrings(lesson.title);
  
  // For the mockup's visual representation, let's say lesson 4 is locked
  const isLocked = index === 3; 

  return (
    <div className="relative group overflow-hidden rounded-xl bg-surface-lowest p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
      {!isLocked ? (
        <>
          <div className="flex gap-2 mb-4">
            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-[10px] font-bold text-primary uppercase tracking-wider">Level {index + 1}</span>
            <span className="px-2 py-0.5 rounded-md bg-success/10 text-[10px] font-bold text-success uppercase tracking-wider">Core</span>
          </div>
          
          <div className="flex justify-between items-start">
             <div>
               <h2 className="font-display text-2xl font-bold text-foreground">
                 {lesson.title}
               </h2>
               <p className="mt-1 text-sm text-on-surface-variant flex items-baseline gap-1">
                 <span className="font-display">{deco.kanji}</span> <span>{deco.romaji}</span>
               </p>
             </div>
             
             {/* Decorative lines like in "Numbers" */}
             {index === 0 && (
               <div className="flex flex-col gap-1 items-end opacity-20">
                 <div className="w-8 h-1 bg-primary rounded-full"></div>
                 <div className="w-12 h-1 bg-primary rounded-full"></div>
                 <div className="w-6 h-1 bg-primary rounded-full"></div>
               </div>
             )}
          </div>
          
          <p className="mt-6 text-xs leading-relaxed text-on-surface-variant line-clamp-2">
            Master essential vocabulary and structures for {lesson.title.toLowerCase()}. Total {totalCards} cards.
          </p>

          <div className="mt-6 flex items-end justify-between gap-4">
            <div className="flex-1 max-w-[120px]">
              <div className="flex items-center justify-between text-[10px] font-bold text-foreground mb-1.5">
                <span>Progress</span>
                <span>{mastery}%</span>
              </div>
              <div className="h-1 rounded-sm bg-secondary-container">
                <div
                  className="h-full rounded-sm bg-primary transition-all duration-500"
                  style={{ width: `${mastery}%` }}
                />
              </div>
            </div>
            
            <Link
              href={`/decks/${lesson.id}`}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary-container"
            >
              Study
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </>
      ) : (
        <>
          {/* Locked State Image */}
          <div className="absolute inset-0 bg-surface-low z-0 opacity-50"></div>
          <div className="relative z-10 opacity-70">
            <div className="w-full h-24 bg-primary/20 rounded-lg mb-4 flex items-center justify-center text-primary/40 font-display text-4xl">
              {deco.kanji}
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">
                 {lesson.title}
            </h2>
            <p className="mt-1 text-xs italic text-on-surface-variant">
              Complete previous lessons to unlock.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-surface-low rounded-md text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-9a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V10a2 2 0 012-2h1V6a5 5 0 0110 0v2h1zm-6-5a3 3 0 00-3 3v2h6V6a3 3 0 00-3-3z"/>
              </svg>
              Locked
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function LessonDeckGrid({ lessons }: LessonDeckGridProps) {
  return (
    <section className="grid gap-6">
      {lessons.map((lesson, index) => (
        <LessonCard key={lesson.id} lesson={lesson} index={index} />
      ))}
    </section>
  );
}
