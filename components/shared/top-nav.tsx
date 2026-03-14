"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type TopNavProps = {
  backHref?: string;
};

const links = [
  { href: "/", label: "Home" },
  { href: "/decks", label: "Decks" },
  { href: "/kana", label: "Kana" },
];

export function TopNav({ backHref = "/" }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const showBack = pathname !== "/";

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-rose-900/10 pb-4">
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
          className="inline-flex items-center gap-1 text-sm font-semibold text-rose-800 hover:underline"
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

      <nav className="flex items-center gap-2">
        {links.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                active
                  ? "bg-rose-100 text-rose-900"
                  : "text-slate-700 hover:bg-rose-50 hover:text-rose-800"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
