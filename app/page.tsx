import lessonsData from "@/data/lessons.json";
import { PageShell } from "@/components/shared/page-shell";
import { HomeClient } from "@/components/home/home-client";
import type { LessonsData } from "@/lib/types";

export default function Home() {
  const lessons = (lessonsData as unknown as LessonsData).lessons;

  return (
    <PageShell>
      <HomeClient lessons={lessons} />
    </PageShell>
  );
}
