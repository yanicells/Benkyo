import type { ReactNode } from "react";

type PageShellProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function PageShell({
  eyebrow,
  title,
  subtitle,
  children,
}: PageShellProps) {
  return (
    <main className="relative mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 sm:py-10">
      <header className="mb-6 space-y-1.5 sm:mb-10 sm:space-y-3">
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-primary sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-2xl text-base leading-relaxed text-on-surface-variant sm:text-lg">
            {subtitle}
          </p>
        )}
      </header>
      {children}
    </main>
  );
}
