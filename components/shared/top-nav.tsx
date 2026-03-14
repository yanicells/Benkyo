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

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-rose-900/10 pb-3">
      <button
        type="button"
        onClick={() => {
          if (window.history.length > 1) {
            router.back();
            return;
          }
          router.push(backHref);
        }}
        className="rounded-full border border-rose-900/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-rose-800 transition hover:border-rose-900/40 hover:bg-rose-50"
      >
        Back
      </button>

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
