"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type TopNavProps = {
  backHref?: string;
};

const links = [
  { href: "/", label: "Home" },
  { href: "/decks", label: "Decks" },
  { href: "/review", label: "Review" },
  { href: "/kana", label: "Kana" },
  { href: "/stats", label: "Stats" },
];

export function TopNav({ backHref = "/" }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const showBack = pathname !== "/";

  return (
    <div className="mb-7 flex flex-wrap items-center justify-between gap-3 pb-4">
      {showBack ? (
        <a
          href={backHref}
          onClick={(event) => {
            event.preventDefault();
            if (window.history.length > 1) {
              router.back();
              return;
            }
            router.push(backHref);
          }}
          className="inline-flex items-center gap-1 rounded-lg bg-surface-low px-3 py-2.5 text-sm font-semibold text-primary transition hover:bg-secondary-container sm:py-1.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span>Back</span>
        </a>
      ) : (
        <span />
      )}

      <nav className="hide-scrollbar glass max-w-full overflow-x-auto rounded-lg p-1 shadow-[0_12px_32px_rgba(0,36,70,0.06)]">
        <div className="flex flex-nowrap items-center gap-1">
          {links.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition sm:py-1.5 ${
                  active
                    ? "bg-white text-primary"
                    : "text-on-surface-variant hover:bg-surface-low hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
