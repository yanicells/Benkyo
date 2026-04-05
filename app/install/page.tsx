import type { Metadata } from "next";
import { PageShell } from "@/components/shared/page-shell";

export const metadata: Metadata = {
  title: "Install",
};

const installGuides = [
  {
    platform: "Windows",
    title: "Install On Windows",
    desc: "Use Benkyo like a desktop app from your taskbar or Start menu.",
    steps: [
      "Open Benkyo in Chrome or Edge.",
      "Click the install icon in the address bar.",
      "Confirm by selecting Install.",
      "Pin Benkyo to Start or taskbar if you want quick access.",
    ],
  },
  {
    platform: "iPhone / iPad",
    title: "Install On iOS",
    desc: "Add Benkyo to your Home Screen from Safari for full-screen usage.",
    steps: [
      "Open Benkyo in Safari.",
      "Tap Share at the bottom of the browser.",
      "Choose Add to Home Screen.",
      "Tap Add, then open Benkyo from your Home Screen.",
    ],
  },
  {
    platform: "Android",
    title: "Install On Android",
    desc: "Install Benkyo for faster launch and app-like navigation.",
    steps: [
      "Open Benkyo in Chrome.",
      "Open the browser menu (three dots).",
      "Tap Install app or Add to Home screen.",
      "Confirm to install, then launch from your app list.",
    ],
  },
];

export default function InstallPage() {
  return (
    <PageShell
      eyebrow="Install"
      title="Install Benkyo"
      subtitle="Use Benkyo as a PWA on desktop and mobile for faster launch, offline-ready behavior, and a cleaner app experience."
    >
      <div className="space-y-4 pb-8">
        {installGuides.map((guide) => (
          <section
            key={guide.platform}
            className="rounded-2xl border border-outline-variant/20 bg-surface-lowest p-5 shadow-[0_12px_32px_rgba(0,36,70,0.06)]"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
              {guide.platform}
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-primary">
              {guide.title}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
              {guide.desc}
            </p>
            <ol className="mt-4 space-y-2">
              {guide.steps.map((step, index) => (
                <li
                  key={step}
                  className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
