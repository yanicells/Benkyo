"use client";

import Image from "next/image";

export function DesktopHeader() {
  return (
    <header className="w-full h-20 px-8 flex items-center justify-between sticky top-0 z-30 bg-surface/80 backdrop-blur-md">
      
      {/* Search Input Stub */}
      <div className="flex-1 max-w-md relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text" 
          placeholder="Search insights..." 
          className="w-full bg-surface-low border-none rounded-xl py-2.5 pl-11 pr-4 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition placeholder:text-on-surface-variant/70 font-semibold"
        />
      </div>

      {/* Right Controls Stub */}
      <div className="flex items-center gap-6 ml-8">
        
        <div className="flex items-center gap-4 text-on-surface-variant">
           <button className="hover:text-primary transition-colors">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
           </button>
           <button className="hover:text-primary transition-colors">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
              </svg>
           </button>
        </div>

        <div className="flex items-center gap-3 border-l border-outline-variant/30 pl-6 cursor-pointer group">
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-foreground">Alex Chen</span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-on-surface-variant">N2 Mastery</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-secondary-container overflow-hidden ring-2 ring-transparent group-hover:ring-primary/30 transition-all border border-outline-variant/30">
            {/* Provide a dummy user avatar */}
            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              A
            </div>
          </div>
        </div>

      </div>

    </header>
  );
}
