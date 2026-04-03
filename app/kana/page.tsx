import { PageShell } from "@/components/shared/page-shell";
import { KanaConfigForm } from "@/components/kana/kana-config-form";

export default function KanaPage() {
  return (
    <PageShell
      title="Practice Setup"
      subtitle="Configure your study session for optimal retention."
    >
      <KanaConfigForm />
    </PageShell>
  );
}
