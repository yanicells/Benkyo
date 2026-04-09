import readingsData from "@/data/reading.json";
import { PageShell } from "@/components/shared/page-shell";
import { ReadingHubClient } from "@/components/reading/reading-hub-client";
import type { ReadingsDataV2 } from "@/lib/types";

export default function ReadingPage() {
  const data = readingsData as unknown as ReadingsDataV2;

  return (
    <PageShell
      eyebrow="Practice"
      title="Reading Practice"
      subtitle="Build comprehension through stories drawn from your lessons."
    >
      <ReadingHubClient difficulties={data.difficulties} />
    </PageShell>
  );
}
