import { PageShell } from "@/components/shared/page-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for the Benkyō Japanese study app.",
};

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Privacy Policy"
      subtitle="Last updated: April 6, 2026"
      backHref="/"
      backLabel="Home"
    >
      <div className="prose prose-sm max-w-2xl text-on-surface-variant space-y-6 pb-10">
        <section className="space-y-2">
          <h2 className="font-display text-lg font-semibold text-foreground">Overview</h2>
          <p>
            Benkyō is a personal Japanese study app. This policy explains what data is collected
            and how it is used. Benkyō is designed to be privacy-friendly — most data never leaves
            your device.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg font-semibold text-foreground">Data Stored Locally</h2>
          <p>
            The following data is stored exclusively in your browser&apos;s{" "}
            <code className="text-xs bg-surface-low px-1 py-0.5 rounded">localStorage</code> and
            is never transmitted to any server:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>SRS (spaced repetition) progress per card</li>
            <li>Daily review counts and accuracy</li>
            <li>Study streak data</li>
            <li>App settings (e.g., daily goal)</li>
          </ul>
          <p className="text-sm">
            This data remains on your device and is cleared if you clear your browser storage.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg font-semibold text-foreground">Account Data (Optional)</h2>
          <p className="text-sm">
            If you sign in with Google, Benkyō stores your name, email address, and profile image
            to identify your account. This data is used solely to associate your study progress
            with your account and is not sold or shared with third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg font-semibold text-foreground">Analytics</h2>
          <p className="text-sm">
            Benkyō uses{" "}
            <span className="font-medium">Vercel Analytics</span> to collect anonymous,
            aggregated page-view data (e.g., which pages are visited). No personal information is
            included in these analytics events.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg font-semibold text-foreground">Copyright Notice</h2>
          <p className="text-sm">
            Study content in Benkyō is adapted from{" "}
            <span className="font-medium italic">
              Genki: An Integrated Course in Elementary Japanese
            </span>{" "}
            (© The Japan Times Ltd.), which is freely available as a reference resource. This app
            is a personal, non-commercial educational tool. All original Genki material remains the
            intellectual property of The Japan Times Ltd. and its authors.
          </p>
          <p className="text-sm">
            If you are a rights holder and have concerns about the use of this material, please
            contact us.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg font-semibold text-foreground">Changes</h2>
          <p className="text-sm">
            This policy may be updated from time to time. Continued use of the app constitutes
            acceptance of the current policy.
          </p>
        </section>
      </div>
    </PageShell>
  );
}
