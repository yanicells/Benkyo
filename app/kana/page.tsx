import { PageShell } from "@/components/shared/page-shell";
import { KanaConfigForm } from "@/components/kana/kana-config-form";

export default function KanaPage() {
  return (
    <PageShell
      eyebrow="Kana"
      title="Kana practice"
      subtitle="Pick script and groups, then drill romaji with strict character-by-character checks."
    >
      <KanaConfigForm />
    </PageShell>
  );
}
