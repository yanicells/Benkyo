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
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: "Lessons",
      href: "/decks",
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="h-6 w-6">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          <path fill="none" d="M0 0h24v24H0z" />
          <path fill="currentColor" d="M20 2H8c-1.1 0-2 .9-2 2v1l9 .01L15 14l5-2.45V2z" />
          <path fill="currentColor" d="M10.82 2.37L9.4 1H8v1.37z" opacity=".3" />
        </svg>
      ) // Replaced with a more generic "lessons" hat or academic icon. Let's use an academic cap icon.
    },
    {
      name: "Kana",
      href: "/kana",
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
        </svg>
      )
    }
  ];

  // Replacing the standard icon for Lessons with Academic Cap
  items[1].icon = (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" stroke="none">
      <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z" />
    </svg>
  );

  return (
    <nav className="fixed bottom-0 left-0 z-40 w-full border-t border-outline-variant/20 bg-surface-lowest pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-16 justify-around">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full min-w-[72px] hover:text-primary transition-colors ${
                isActive ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              <div className={`mb-1 ${isActive ? "opacity-100" : "opacity-60"}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-semibold tracking-wide ${isActive ? "opacity-100" : "opacity-80"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
