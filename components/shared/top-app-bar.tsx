"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export function TopAppBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const isSession = pathname.includes("/session");

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass">
        <div className="flex h-14 items-center justify-between px-4">
          {isSession ? (
            <button 
              type="button" 
              onClick={() => {
                if (window.history.length > 1) {
                  router.back();
                } else {
                  router.push("/");
                }
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-surface-low transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="sr-only">Close</span>
            </button>
          ) : (
            <button 
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-surface-low transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="sr-only">Menu</span>
            </button>
          )}
          
          <Link href="/" className="font-display text-xl font-bold italic tracking-wide text-primary">
            Benkyo
          </Link>
          
          <button
            title="Settings coming soon"
            aria-disabled="true"
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground opacity-50 cursor-not-allowed"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="sr-only">Settings</span>
          </button>
        </div>
      </header>

      {/* Global Sidebar Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative w-80 max-w-[80vw] bg-surface h-full shadow-2xl flex flex-col pt-16 px-6 animate-in slide-in-from-left-full">
            <button 
              className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-foreground"
              onClick={() => setMenuOpen(false)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="font-display text-2xl font-bold text-primary mb-8 italic">Benkyo</h2>

            <nav className="flex flex-col gap-4">
              <Link href="/" onClick={() => setMenuOpen(false)} className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/decks" onClick={() => setMenuOpen(false)} className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                Lesson Decks
              </Link>
              <Link href="/kana" onClick={() => setMenuOpen(false)} className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                Kana Practice
              </Link>
              <Link href="/review" onClick={() => setMenuOpen(false)} className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                Review
              </Link>
              <Link href="/stats" onClick={() => setMenuOpen(false)} className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                Stats
              </Link>
            </nav>

            <div className="mt-auto pb-safe pb-8">
              <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">Zen Scholar</p>
              <p className="text-[10px] text-on-surface-variant/70 mt-1">v0.1.0-alpha</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
