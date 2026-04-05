import Link from "next/link";
import type { ReactNode } from "react";

type PageShellProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  stickyHeader?: boolean;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
};

export function PageShell({
  eyebrow,
  title,
  subtitle,
  stickyHeader,
  backHref,
  backLabel,
  children,
}: PageShellProps) {
  return (
    <section className="relative mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 sm:py-10">
      {backHref && (
        <div className="sticky top-14 lg:top-16 z-20 -mx-4 mb-4 border-b border-outline-variant/10 bg-surface/95 px-4 py-3 backdrop-blur-md sm:-mx-8 sm:px-8">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {backLabel ?? "Back"}
          </Link>
        </div>
      )}
      {title && (
        <header
          className={`mb-6 space-y-1.5 sm:mb-10 sm:space-y-3 ${stickyHeader ? "sticky top-14 lg:top-16 z-20 bg-surface/95 backdrop-blur-md -mx-4 px-4 sm:-mx-8 sm:px-8 py-4" : ""}`}
        >
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant sm:text-sm">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-[clamp(1.9rem,7vw,3rem)] font-bold leading-tight tracking-tight text-primary">
            {title}
          </h1>
          {subtitle && (
            <p className="max-w-2xl text-[clamp(0.95rem,2.9vw,1.125rem)] leading-relaxed text-on-surface-variant">
              {subtitle}
            </p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}
