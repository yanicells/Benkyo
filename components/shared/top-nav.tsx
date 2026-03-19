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
    <div className="mb-7 flex flex-wrap items-center justify-between gap-3 border-b border-rose-900/10 pb-4">
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
          className="inline-flex items-center gap-1 rounded-full border border-rose-900/15 px-3 py-1.5 text-sm font-semibold text-rose-800 transition hover:border-rose-900/35 hover:bg-rose-50"
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

      <nav className="rounded-full border border-rose-900/10 bg-white/80 p-1 shadow-[0_2px_8px_rgba(74,24,32,0.08)]">
        <div className="flex items-center gap-1">
          {links.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                  active
                    ? "bg-rose-100 text-rose-900"
                    : "text-slate-700 hover:bg-rose-50 hover:text-rose-800"
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
