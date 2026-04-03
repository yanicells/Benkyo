"use client";

import Link from "next/link";
import { useState } from "react";

import type { Lesson } from "@/lib/types";
import { getLessonMastery } from "@/lib/srs";

type LessonDeckGridProps = {
  lessons: Lesson[];
};

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
  
  const isLocked = index === 3; 

  return (
    <Link href={isLocked ? "#" : `/decks/${lesson.id}`} className={`relative group overflow-hidden rounded-[1.5rem] bg-surface-lowest p-6 shadow-[0_4px_20px_rgba(0,14,33,0.03)] transition duration-300 hover:-translate-y-1 hover:shadow-md ${isLocked ? 'pointer-events-none cursor-default' : 'cursor-pointer'}`}>
      {!isLocked ? (
        <>
          <div className="flex gap-2 mb-4">
            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-[10px] font-bold text-primary uppercase tracking-wider">Level {index + 1}</span>
            <span className="px-2 py-0.5 rounded-md bg-success/10 text-[10px] font-bold text-success uppercase tracking-wider">Core</span>
          </div>
          
          <div className="flex justify-between items-start">
             <div>
               <h2 className="font-display text-xl lg:text-2xl font-bold text-foreground transition-colors group-hover:text-primary">
                 {lesson.title}
               </h2>
               <p className="mt-1 text-sm text-on-surface-variant flex items-baseline gap-1">
                 <span className="font-display">{deco.kanji}</span> <span>{deco.romaji}</span>
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
            Master essential vocabulary and structures for {lesson.title.toLowerCase()}. Total {totalCards} cards.
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
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
               </svg>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-surface-low z-0 opacity-50"></div>
          <div className="relative z-10 opacity-70">
            <div className="w-full h-24 bg-primary/10 rounded-xl mb-4 flex items-center justify-center text-primary/40 font-display text-4xl">
              {deco.kanji}
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">
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
    </Link>
  );
}

export function LessonDeckGrid({ lessons }: LessonDeckGridProps) {
  return (
    <div className="flex flex-col gap-8 lg:gap-10 max-w-screen-xl mx-auto w-full pb-16">
      
      {/* Editorial Dashboard Section - Desktop Target */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        
        {/* Hiragana */}
        <Link href="/kana?tab=hiragana" className="lg:col-span-6 bg-surface-lowest rounded-[2rem] p-8 lg:p-10 shadow-[0_12px_40px_rgba(0,14,33,0.06)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden group flex flex-col justify-between min-h-[260px]">
           <div className="flex justify-between items-start mb-6">
             <span className="font-japanese-display text-5xl text-surface-low opacity-60">あ</span>
             <div className="w-10 h-10 rounded-xl bg-surface-low flex items-center justify-center text-foreground group-hover:text-primary transition-colors">
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/></svg>
             </div>
           </div>
           <div>
             <h3 className="font-display text-3xl font-bold text-foreground mb-6">Hiragana</h3>
             <div className="flex items-end justify-between text-[10px] uppercase font-bold tracking-wider text-secondary mb-2">
                <span>Mastery Progress</span>
                <span className="text-xl text-foreground font-display font-extrabold tracking-normal">85%</span>
             </div>
             <div className="h-1.5 rounded-full bg-secondary-container w-full overflow-hidden mb-6">
               <div className="h-full bg-primary" style={{width: '85%'}}></div>
             </div>
             <div className="flex gap-2">
                <span className="px-3 py-1.5 bg-surface-low rounded-lg text-[10px] font-semibold text-secondary">46 Characters</span>
                <span className="px-3 py-1.5 bg-surface-low rounded-lg text-[10px] font-semibold text-secondary">Introductory</span>
             </div>
           </div>
        </Link>
        
        {/* Katakana */}
        <Link href="/kana?tab=katakana" className="lg:col-span-6 bg-surface-lowest rounded-[2rem] p-8 lg:p-10 shadow-[0_12px_40px_rgba(0,14,33,0.06)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden group flex flex-col justify-between min-h-[260px]">
           <div className="flex justify-between items-start mb-6">
             <span className="font-japanese-display text-5xl text-surface-low opacity-60">ア</span>
             <div className="w-10 h-10 rounded-xl bg-surface-low flex items-center justify-center text-foreground group-hover:text-primary transition-colors">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/></svg>
             </div>
           </div>
           <div>
             <h3 className="font-display text-3xl font-bold text-foreground mb-6">Katakana</h3>
             <div className="flex items-end justify-between text-[10px] uppercase font-bold tracking-wider text-secondary mb-2">
                <span>Mastery Progress</span>
                <span className="text-xl text-foreground font-display font-extrabold tracking-normal">42%</span>
             </div>
             <div className="h-1.5 rounded-full bg-secondary-container w-full overflow-hidden mb-6">
               <div className="h-full bg-primary" style={{width: '42%'}}></div>
             </div>
             <div className="flex gap-2">
                <span className="px-3 py-1.5 bg-surface-low rounded-lg text-[10px] font-semibold text-secondary">46 Characters</span>
                <span className="px-3 py-1.5 bg-surface-low rounded-lg text-[10px] font-semibold text-secondary">Loanwords</span>
             </div>
           </div>
        </Link>
        
        {/* Kanji Mastery (Full width) */}
        <div className="lg:col-span-12 bg-surface-lowest rounded-[2rem] p-8 lg:p-10 shadow-[0_12px_40px_rgba(0,14,33,0.06)] flex flex-col lg:flex-row gap-10 items-center">
           <div className="lg:w-[40%] text-left w-full">
             <span className="font-japanese-display text-6xl text-surface-low opacity-60 mb-2 inline-block">語</span>
             <h3 className="font-display text-3xl font-bold text-foreground mb-4">Kanji Mastery</h3>
             <p className="text-sm text-secondary leading-relaxed max-w-sm mb-6">
               Levels N5 through N1. From basic pictograms to complex academic discourse.
             </p>
             <button className="flex items-center gap-2 px-4 py-2 bg-[#8ef4e4] rounded-lg text-[#2a9a8c] text-xs font-bold uppercase tracking-wider transition hover:opacity-80">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
               RECOMMENDED FOR YOU
             </button>
           </div>
           
           <div className="lg:w-[60%] w-full flex flex-col justify-center">
              <div className="flex items-end justify-between text-[10px] uppercase font-bold tracking-wider text-secondary mb-2">
                <span>Global Progress (2,136 Kanji)</span>
                <span className="text-2xl text-foreground font-display font-extrabold tracking-normal">12%</span>
             </div>
             <div className="h-1.5 rounded-full bg-secondary-container w-full overflow-hidden mb-8">
               <div className="h-full bg-primary" style={{width: '12%'}}></div>
             </div>
             
             <div className="flex gap-2 w-full">
                {/* N5 */}
                <div className="flex-1 bg-surface-low rounded-xl p-4 flex flex-col items-center justify-center border-b-2 border-primary">
                   <span className="text-[10px] font-bold text-primary uppercase mb-1 tracking-wider">N5</span>
                   <span className="font-display text-lg font-bold text-foreground">100%</span>
                </div>
                {/* N4 */}
                <div className="flex-1 bg-surface-low rounded-xl p-4 flex flex-col items-center justify-center border-b-2 border-primary/40 relative overflow-hidden">
                   <div className="absolute left-0 bottom-0 top-0 bg-primary/5 w-1/4"></div>
                   <span className="text-[10px] font-bold text-foreground uppercase mb-1 tracking-wider relative z-10">N4</span>
                   <span className="font-display text-lg font-bold text-foreground relative z-10">24%</span>
                </div>
                {/* N3 */}
                <div className="flex-1 bg-surface rounded-xl p-4 flex flex-col items-center justify-center opacity-50">
                   <span className="text-[10px] font-bold text-secondary uppercase mb-1 tracking-wider">N3</span>
                   <span className="font-display text-lg font-bold text-on-surface-variant">0%</span>
                </div>
                {/* N2 */}
                <div className="flex-1 bg-surface rounded-xl p-4 flex flex-col items-center justify-center opacity-50">
                   <span className="text-[10px] font-bold text-secondary uppercase mb-1 tracking-wider">N2</span>
                   <span className="font-display text-lg font-bold text-on-surface-variant">0%</span>
                </div>
                {/* N1 */}
                <div className="flex-1 bg-surface rounded-xl p-4 flex flex-col items-center justify-center opacity-50">
                   <span className="text-[10px] font-bold text-secondary uppercase mb-1 tracking-wider">N1</span>
                   <span className="font-display text-lg font-bold text-on-surface-variant">0%</span>
                </div>
             </div>
           </div>
        </div>
        
        {/* Grammar Block */}
        <Link href="/decks/grammar-particles" className="lg:col-span-4 bg-surface-lowest rounded-[2rem] p-8 lg:p-10 shadow-[0_12px_40px_rgba(0,14,33,0.06)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden group flex flex-col justify-between">
           <div className="flex justify-between items-start mb-12">
             <span className="font-japanese-display text-5xl text-surface-low opacity-60">文</span>
             <div className="w-10 h-10 rounded-xl bg-surface-low flex items-center justify-center text-foreground group-hover:text-primary transition-colors">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
             </div>
           </div>
           <div>
             <h3 className="font-display text-3xl font-bold text-foreground mb-8">Grammar</h3>
             <div className="flex items-end justify-between text-[10px] uppercase font-bold tracking-wider text-secondary mb-2">
                <span>Sentence Patterns</span>
                <span className="text-xl text-foreground font-display font-extrabold tracking-normal">28%</span>
             </div>
             <div className="h-1.5 rounded-full bg-secondary-container w-full overflow-hidden mb-6">
               <div className="h-full bg-primary w-[28%]"></div>
             </div>
             <div className="flex gap-2">
                <span className="px-3 py-1.5 bg-surface-low rounded-lg text-[9px] font-semibold text-secondary uppercase tracking-wider">Particles</span>
                <span className="px-3 py-1.5 bg-surface-low rounded-lg text-[9px] font-semibold text-secondary uppercase tracking-wider">Verb Conjugation</span>
             </div>
           </div>
        </Link>
        
        {/* Aesthetic Block */}
        <div className="lg:col-span-8 bg-[#0a0a0c] rounded-[2rem] p-8 lg:p-10 shadow-[0_12px_40px_rgba(0,14,33,0.06)] relative overflow-hidden group flex flex-col justify-end min-h-[300px]">
           <div className="absolute inset-0 bg-cover bg-center mix-blend-lighten opacity-40 group-hover:scale-105 transition-transform duration-1000" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542051812871-757511640185?q=80&w=1200&auto=format&fit=crop')" }}></div>
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
           
           <div className="relative z-10">
             <h4 className="font-japanese-display text-3xl md:text-5xl text-white/90 mb-3 drop-shadow-lg italic font-light">「継続は力なり」</h4>
             <p className="font-display text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-[#8ef4e4] drop-shadow-md">
               Continuity is strength.
             </p>
           </div>
        </div>

      </section>

      {/* Structured Modules (Original Loop mapped cleanly) */}
      <section className="mt-10">
        <h3 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          Available Modules 
          <span className="px-2 py-0.5 rounded-md bg-surface-low text-xs font-semibold text-secondary tracking-widest uppercase">Select carefully</span>
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
