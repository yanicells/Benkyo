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
      title="Practice Setup"
      subtitle="Configure your study session for optimal retention."
    >
      <KanaConfigForm initialScript={initialScript} />
    </PageShell>
  );
}
