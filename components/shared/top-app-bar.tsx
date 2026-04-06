"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/shared/auth-provider";
import { signIn } from "@/lib/auth-client";
import { SettingsModal } from "@/components/stats/settings-modal";

export function TopAppBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { isSignedIn, user } = useAuth();

  const isSession = pathname.includes("/session");
  const hideForStudySession =
    pathname === "/kana/session" ||
    (pathname.startsWith("/decks/") && pathname.includes("/session"));

  if (hideForStudySession) return null;

  return (
    <>
      <header className="w-full bg-surface/90 backdrop-blur-md border-b border-outline-variant/10">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Left: close in session, brand otherwise */}
          {isSession ? (
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) router.back();
                else router.push("/");
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-surface-low transition-colors"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="sr-only">Close</span>
            </button>
          ) : (
            <Link
              href="/"
              suppressHydrationWarning
              className="flex items-center gap-2.5 font-display text-xl font-bold tracking-tight text-primary"
            >
              <Image
                src="/icon1-192.svg"
                alt="Benkyo logo"
                width={24}
                height={24}
                className="h-6 w-6 shrink-0"
                priority
              />
              <span>Benkyo</span>
            </Link>
          )}

          {/* Right: settings gear + avatar/sign-in */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {!isSession && (
              <Link
                href="/install"
                className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-low"
                aria-label="Install app"
              >
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
                    d="M12 3v10m0 0l-4-4m4 4l4-4M5 15v2a2 2 0 002 2h10a2 2 0 002-2v-2"
                  />
                </svg>
              </Link>
            )}
            {!isSession && (
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-low transition-colors"
                aria-label="Open settings"
              >
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            )}

            {isSignedIn && user ? (
              <Link
                href="/profile"
                className="flex h-10 w-10 items-center justify-center"
                aria-label="Profile"
              >
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-8 w-8 rounded-full ring-2 ring-primary/20"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() =>
                    signIn.social({ provider: "google", callbackURL: "/" })
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-low text-primary transition-colors hover:bg-secondary-container sm:hidden"
                  aria-label="Sign in"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
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
                </button>

                <button
                  type="button"
                  onClick={() =>
                    signIn.social({ provider: "google", callbackURL: "/" })
                  }
                  className="hidden h-10 items-center gap-1.5 rounded-lg bg-surface-low px-3 text-xs font-semibold text-primary transition-colors hover:bg-secondary-container sm:flex"
                >
                  <svg
                    className="h-3.5 w-3.5 shrink-0"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
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
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </>
  );
}
