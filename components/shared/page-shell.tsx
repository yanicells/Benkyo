import type { ReactNode } from "react";

type PageShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function PageShell({ eyebrow, title, subtitle, children }: PageShellProps) {
  return (
    <main className="relative mx-auto min-h-screen w-full max-w-6xl px-4 py-10 sm:px-8">
      <div className="fade-in-up rounded-[2rem] border border-white/20 bg-white/60 p-6 shadow-2xl shadow-rose-950/10 backdrop-blur-xl sm:p-10">
        <header className="mb-8 space-y-3 border-b border-rose-950/10 pb-6">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-rose-700">{eyebrow}</p>
          <h1 className="font-display text-4xl leading-tight text-slate-900 sm:text-5xl">{title}</h1>
          <p className="max-w-2xl text-sm text-slate-700 sm:text-base">{subtitle}</p>
        </header>
        {children}
      </div>
    </main>
  );
}
