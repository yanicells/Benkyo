import type { ReactNode } from "react";
import { TopNav } from "@/components/shared/top-nav";

type PageShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  backHref?: string;
  children: ReactNode;
};

export function PageShell({
  eyebrow,
  title,
  subtitle,
  backHref,
  children,
}: PageShellProps) {
  return (
    <main className="relative mx-auto min-h-screen w-full max-w-6xl px-2 py-3 sm:px-6 sm:py-8">
      <div className="rounded-2xl border border-rose-900/10 bg-white/80 p-3 shadow-[0_10px_24px_rgba(74,24,32,0.10)] backdrop-blur-sm sm:rounded-[2rem] sm:p-8">
        <TopNav backHref={backHref} />
        <header className="mb-3 space-y-1.5 border-b border-rose-950/10 pb-3 sm:mb-8 sm:space-y-3 sm:pb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-700">
            {eyebrow}
          </p>
          <h1 className="font-display text-3xl leading-tight text-slate-900 sm:text-5xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">
            {subtitle}
          </p>
        </header>
        {children}
      </div>
    </main>
  );
}
