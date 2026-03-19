import lessonsData from "@/data/lessons.json";
import { PageShell } from "@/components/shared/page-shell";
import { HomeClient } from "@/components/home/home-client";
import type { LessonsData } from "@/lib/types";

export default function Home() {
  const lessons = (lessonsData as unknown as LessonsData).lessons;

  return (
    <PageShell
      eyebrow="Study hub"
      title="Benkyō"
      subtitle="Personal Genki-first drills for vocabulary and kana mastery. No accounts, no database, just focused reps."
      backHref="/"
    >
      <HomeClient lessons={lessons} />
    </PageShell>
  );
}
