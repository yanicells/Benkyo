import readingsData from "@/data/reading.json";
import { PageShell } from "@/components/shared/page-shell";
import { ReadingConfigClient } from "@/components/reading/reading-config-client";
import type { ReadingsData } from "@/lib/types";

export default function ReadingPage() {
  const passages = (readingsData as unknown as ReadingsData).passages;

  return (
    <PageShell
      eyebrow="Practice"
      title="Reading Practice"
      subtitle="Build comprehension with sentences and paragraphs from your lessons."
    >
      <ReadingConfigClient passages={passages} />
    </PageShell>
  );
}
