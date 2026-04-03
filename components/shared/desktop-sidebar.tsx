"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 h-full bg-surface-lowest flex flex-col py-10 px-8 shadow-[1px_0_10px_rgba(0,36,70,0.02)] sticky top-0 relative z-10 transition-all duration-300">
      
      <div className="mb-14">
        <Link href="/" className="flex flex-col">
          <span className="font-display font-bold text-2xl text-primary leading-tight">Meditative</span>
          <span className="font-display font-bold text-2xl text-primary leading-tight">Manuscript</span>
        </Link>
      </div>

      <nav className="flex flex-col gap-2 mb-12">
        <Link 
          href="/" 
          className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-semibold ${pathname === "/" ? "bg-surface-low text-primary" : "text-on-surface-variant hover:bg-surface hover:text-foreground"}`}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z" />
          </svg>
          <span className="text-sm tracking-wide">HOME</span>
        </Link>

        <Link 
          href="/decks" 
          className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-semibold ${pathname.startsWith("/decks") || pathname.startsWith("/kana") ? "bg-surface-low text-primary" : "text-on-surface-variant hover:bg-surface hover:text-foreground"}`}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z" />
          </svg>
          <span className="text-sm tracking-wide uppercase">Lessons</span>
        </Link>

        <Link 
          href="#" 
          className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-semibold text-on-surface-variant hover:bg-surface hover:text-foreground"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-sm tracking-wide uppercase">Community</span>
        </Link>

        <Link 
          href="#" 
          className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-semibold text-on-surface-variant hover:bg-surface hover:text-foreground"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-sm tracking-wide uppercase">Profile</span>
        </Link>
      </nav>

      <div className="mt-auto">
         <button className="w-full btn-primary-gradient py-4 rounded-xl text-white font-bold text-sm shadow-[0_8px_24px_rgba(0,36,70,0.12)] transition hover:opacity-90 hover:translate-y-[-1px]">
           Start Daily Session
         </button>
      </div>

    </aside>
  );
}
