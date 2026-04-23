"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();

  if (pathname.includes("/session")) {
    return null;
  }

  const items = [
    {
      name: "Home",
      href: "/",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: "Lessons",
      href: "/decks",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z" />
        </svg>
      ),
    },
    {
      name: "Kanji",
      href: "/decks/kanji",
      icon: (
        <span className="font-japanese-display text-lg leading-none">漢</span>
      ),
    },
    {
      name: "Reading",
      href: "/reading",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>
      ),
    },
    {
      name: "Reviewer",
      href: "/reviewer",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
    },
    {
      name: "Kana",
      href: "/kana",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-40 w-full border-t border-outline-variant/20 bg-surface-lowest pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-16 justify-around">
        {items.map((item) => {
          // Kanji lives under /decks/kanji; don't highlight Lessons when we're
          // actually on the Kanji route.
          const isActive =
            item.href === "/decks"
              ? pathname === "/decks" ||
                (pathname.startsWith("/decks/") &&
                  !pathname.startsWith("/decks/kanji"))
              : pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full min-w-15 hover:text-primary transition-colors ${
                isActive ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              <div
                className={`mb-1 ${isActive ? "opacity-100" : "opacity-60"}`}
              >
                {item.icon}
              </div>
              <span
                className={`text-[9px] font-semibold tracking-wide ${isActive ? "opacity-100" : "opacity-80"}`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
