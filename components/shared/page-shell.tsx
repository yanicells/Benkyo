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
    <main className="relative mx-auto min-h-screen w-full max-w-5xl px-3 py-4 sm:px-6 sm:py-8">
      <div className="rounded-3xl border border-rose-900/15 bg-white p-4 shadow-sm sm:p-8">
        <TopNav backHref={backHref} />
        <header className="mb-5 space-y-2 border-b border-rose-950/10 pb-4 sm:mb-8 sm:space-y-3 sm:pb-6">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-rose-700">
            {eyebrow}
          </p>
          <h1 className="font-display text-3xl leading-tight text-slate-900 sm:text-5xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm text-slate-700 sm:text-base">
            {subtitle}
          </p>
        </header>
        {children}
      </div>
    </main>
  );
}
