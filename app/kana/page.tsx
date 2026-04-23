import { PageShell } from "@/components/shared/page-shell";
import { KanaConfigForm } from "@/components/kana/kana-config-form";
import type { KanaScript } from "@/lib/types";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function KanaPage({ searchParams }: Props) {
  const query = await searchParams;
  const tabParam = Array.isArray(query.tab) ? query.tab[0] : query.tab;
  const initialScript: KanaScript =
    tabParam === "katakana" ? "katakana" : "hiragana";

  return (
    <PageShell
      eyebrow="Kana"
      title="Kana Practice"
      subtitle="Select the rows you want to drill and start a session."
    >
      <KanaConfigForm
        initialScript={initialScript}
        initialTab={initialScript}
      />
    </PageShell>
  );
}
