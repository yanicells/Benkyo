import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-outline-variant/10 px-4 py-5 sm:px-8 text-center space-y-1.5">
      <p className="text-[11px] text-on-surface-variant/60 leading-relaxed max-w-xl mx-auto">
        Study content is adapted from{" "}
        <span className="font-medium">Genki: An Integrated Course in Elementary Japanese</span>{" "}
        (© The Japan Times), used here for personal educational purposes only. All rights reserved by the original publishers.
      </p>
      <p className="text-[11px] text-on-surface-variant/40">
        &copy; {new Date().getFullYear()} Benkyo &middot;{" "}
        <Link
          href="/legal/privacy"
          className="underline underline-offset-2 hover:text-on-surface-variant transition-colors"
        >
          Privacy Policy
        </Link>
      </p>
    </footer>
  );
}
