"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/shared/auth-provider";
import { signIn } from "@/lib/auth-client";

const navItems = [
  {
    href: "/",
    label: "HOME",
    exact: true,
    icon: (
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z" />
      </svg>
    ),
  },
  {
    href: "/path",
    label: "PATH",
    exact: false,
    icon: (
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      </svg>
    ),
  },
  {
    href: "/decks",
    label: "LESSONS",
    exact: false,
    icon: (
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    href: "/kana",
    label: "KANA",
    exact: false,
    icon: (
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
      </svg>
    ),
  },
  {
    href: "/review",
    label: "REVIEW",
    exact: false,
    icon: (
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    ),
  },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const { isSignedIn, user } = useAuth();

  return (
    <aside className="w-72 h-screen sticky top-0 bg-surface-lowest flex flex-col py-10 px-8 shadow-[1px_0_10px_rgba(0,36,70,0.02)] z-10 transition-all duration-300">
      <div className="mb-14">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/icon1-192.svg"
            alt="Benkyo logo"
            width={30}
            height={30}
            className="h-7 w-7 shrink-0"
            priority
          />
          <span className="font-display font-bold text-2xl text-primary leading-tight">
            Benkyo
          </span>
        </Link>
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 mb-6 pr-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-semibold ${
                isActive
                  ? "bg-surface-low text-primary"
                  : "text-on-surface-variant hover:bg-surface hover:text-foreground"
              }`}
            >
              {item.icon}
              <span className="text-sm tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Auth section at bottom */}
      <div className="mt-auto pt-4 border-t border-outline-variant/20 space-y-3">
        {isSignedIn && user ? (
          <Link
            href="/profile"
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all hover:bg-surface-low group ${
              pathname === "/profile"
                ? "bg-surface-low text-primary"
                : "text-on-surface-variant"
            }`}
          >
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name}
                className="h-8 w-8 rounded-full ring-2 ring-transparent group-hover:ring-primary/20 transition-all shrink-0"
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate">
                {user.name}
              </p>
              <p className="text-[10px] text-on-surface-variant">
                View profile
              </p>
            </div>
            <svg
              className="w-4 h-4 text-on-surface-variant/40 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        ) : (
          <button
            type="button"
            onClick={() =>
              signIn.social({ provider: "google", callbackURL: "/" })
            }
            className="flex w-full items-center gap-3 rounded-xl border border-outline-variant/40 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface-low hover:border-primary/30 transition-all"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>
        )}

        <Link
          href="/review"
          className="flex w-full items-center justify-center btn-primary-gradient py-3 rounded-xl text-white font-bold text-sm shadow-[0_8px_24px_rgba(0,36,70,0.12)] transition hover:opacity-90 hover:-translate-y-px"
        >
          Start Daily Session
        </Link>
      </div>
    </aside>
  );
}
