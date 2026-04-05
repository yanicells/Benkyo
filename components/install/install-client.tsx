"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { PageShell } from "@/components/shared/page-shell";
import { usePlatform } from "@/components/shared/use-platform";
import type { Platform } from "@/components/shared/use-platform";
import { useInstallPrompt } from "@/components/shared/use-install-prompt";
import {
  IosShareIcon,
  IosAddToHome,
  IosConfirm,
  AndroidMenu,
  AndroidInstall,
  DesktopInstallIcon,
  SuccessCheckmark,
} from "./illustrations";

/* ── Shared sub-components ────────────────────────────── */

function StepCard({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[1.5rem] bg-surface-lowest shadow-[0_12px_40px_rgba(0,14,33,0.06)] p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">
          {step}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-bold text-foreground leading-tight">
            {title}
          </h3>
          <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-5 flex justify-center">{children}</div>
    </div>
  );
}

type Tab = "ios" | "android" | "desktop";

function platformToTab(p: Platform): Tab {
  if (p === "ios") return "ios";
  if (p === "android") return "android";
  return "desktop";
}

const tabLabels: Record<Tab, string> = {
  ios: "iOS",
  android: "Android",
  desktop: "Desktop",
};

/* ── Platform instruction sections ────────────────────── */

function IosInstructions() {
  return (
    <div className="space-y-4">
      <StepCard
        step={1}
        title="Open in Safari"
        description="Benkyo must be opened in Safari — other iOS browsers don't support installing web apps."
      >
        <div className="rounded-xl bg-surface-low px-4 py-3 text-sm text-on-surface-variant text-center">
          If you&apos;re using Chrome or another browser, copy the URL and paste it into Safari.
        </div>
      </StepCard>

      <StepCard
        step={2}
        title="Tap the Share button"
        description="Find the share icon in Safari's bottom toolbar — it looks like a square with an upward arrow."
      >
        <IosShareIcon />
      </StepCard>

      <StepCard
        step={3}
        title='Tap "Add to Home Screen"'
        description="Scroll down in the share sheet and look for the option with a plus icon."
      >
        <IosAddToHome />
      </StepCard>

      <StepCard
        step={4}
        title='Tap "Add"'
        description='Confirm the name and tap "Add" in the top-right corner. Benkyo will appear on your home screen.'
      >
        <IosConfirm />
      </StepCard>
    </div>
  );
}

function AndroidInstructions({ canPrompt, onInstall }: { canPrompt: boolean; onInstall: () => void }) {
  return (
    <div className="space-y-4">
      {canPrompt && (
        <div className="rounded-[1.5rem] btn-primary-gradient p-6 shadow-[0_12px_40px_rgba(0,14,33,0.15)] text-center">
          <p className="text-white/70 text-sm mb-3">Quick install available</p>
          <button
            type="button"
            onClick={onInstall}
            className="rounded-xl bg-white/20 hover:bg-white/30 transition px-6 py-3 text-white font-semibold text-sm"
          >
            Install Benkyo
          </button>
        </div>
      )}

      <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant font-bold">
        {canPrompt ? "Or install manually" : "Manual installation"}
      </p>

      <StepCard
        step={1}
        title="Open the Chrome menu"
        description="Tap the three dots in the top-right corner of Chrome."
      >
        <AndroidMenu />
      </StepCard>

      <StepCard
        step={2}
        title='Tap "Install app"'
        description='Look for "Install app" or "Add to Home Screen" in the menu. Confirm to add Benkyo to your home screen.'
      >
        <AndroidInstall />
      </StepCard>
    </div>
  );
}

function DesktopInstructions({ canPrompt, onInstall }: { canPrompt: boolean; onInstall: () => void }) {
  return (
    <div className="space-y-4">
      {canPrompt && (
        <div className="rounded-[1.5rem] btn-primary-gradient p-6 shadow-[0_12px_40px_rgba(0,14,33,0.15)] text-center">
          <p className="text-white/70 text-sm mb-3">Quick install available</p>
          <button
            type="button"
            onClick={onInstall}
            className="rounded-xl bg-white/20 hover:bg-white/30 transition px-6 py-3 text-white font-semibold text-sm"
          >
            Install Benkyo
          </button>
        </div>
      )}

      <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant font-bold">
        {canPrompt ? "Or install manually" : "Manual installation"}
      </p>

      <StepCard
        step={1}
        title="Look for the install icon"
        description="In Chrome or Edge, look for the install icon in the address bar — it looks like a monitor with a down arrow."
      >
        <DesktopInstallIcon />
      </StepCard>

      <StepCard
        step={2}
        title="Click Install"
        description='Click the icon, then confirm by clicking "Install" in the dialog. Benkyo will open as its own app window.'
      >
        <div className="rounded-xl bg-surface-low px-4 py-3 text-sm text-on-surface-variant text-center">
          You can also use the browser menu (three dots) and look for &quot;Install Benkyo&quot;.
        </div>
      </StepCard>
    </div>
  );
}

/* ── Main component ───────────────────────────────────── */

export function InstallClient() {
  const platformInfo = usePlatform();
  const { canPrompt, triggerInstall } = useInstallPrompt();
  const [activeTab, setActiveTab] = useState<Tab>("ios");

  // Auto-select platform tab once detected
  const [tabOverridden, setTabOverridden] = useState(false);
  useEffect(() => {
    if (platformInfo && !tabOverridden) {
      setActiveTab(platformToTab(platformInfo.platform));
    }
  }, [platformInfo, tabOverridden]);

  const onInstall = () => {
    void triggerInstall();
  };

  // Loading state
  if (!platformInfo) {
    return (
      <PageShell eyebrow="App" title="Install Benkyo" backHref="/profile" backLabel="Profile">
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </PageShell>
    );
  }

  // Already installed
  if (platformInfo.isStandalone) {
    return (
      <PageShell eyebrow="App" title="Install Benkyo" backHref="/profile" backLabel="Profile">
        <div className="rounded-[2rem] bg-surface-lowest shadow-[0_12px_40px_rgba(0,14,33,0.06)] p-8 relative overflow-hidden text-center">
          <span
            className="absolute right-6 top-1/2 -translate-y-1/2 font-japanese-display text-[120px] leading-none text-surface-low font-bold pointer-events-none select-none"
            aria-hidden
          >
            得
          </span>
          <div className="relative flex flex-col items-center gap-4 py-4">
            <SuccessCheckmark />
            <h2 className="font-display text-2xl font-bold text-foreground">
              You&apos;re all set
            </h2>
            <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed">
              Benkyo is installed on your device. You can access it from your home screen or app launcher.
            </p>
          </div>
        </div>
      </PageShell>
    );
  }

  // Install guide
  return (
    <PageShell
      eyebrow="App"
      title="Install Benkyo"
      subtitle="Add Benkyo to your home screen for offline access and a native app experience."
      backHref="/profile"
      backLabel="Profile"
    >
      <div className="space-y-6">
        {/* Platform tabs */}
        <div className="rounded-xl bg-surface-low p-1 flex">
          {(["ios", "android", "desktop"] as Tab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setTabOverridden(true);
              }}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                activeTab === tab
                  ? "bg-surface-lowest text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-foreground"
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        {/* Instructions */}
        {activeTab === "ios" && <IosInstructions />}
        {activeTab === "android" && (
          <AndroidInstructions canPrompt={canPrompt} onInstall={onInstall} />
        )}
        {activeTab === "desktop" && (
          <DesktopInstructions canPrompt={canPrompt} onInstall={onInstall} />
        )}

        {/* Footer note */}
        <p className="text-center text-[11px] text-on-surface-variant pt-2 pb-4">
          Benkyo is a Progressive Web App (PWA). No app store download required.
        </p>
      </div>
    </PageShell>
  );
}
