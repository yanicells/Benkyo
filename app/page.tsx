import lessonsData from "@/data/lessons.json";
import { PageShell } from "@/components/shared/page-shell";
import { HomeClient } from "@/components/home/home-client";
import { Footer } from "@/components/shared/footer";
import type { LessonsData } from "@/lib/types";

export default function Home() {
  const lessons = (lessonsData as unknown as LessonsData).lessons.filter(
    (l) => !l.id.startsWith("jlpt-"),
  );

  return (
    <>
      <PageShell  
        eyebrow="Okaeri"
        title="Benkyō shimasu"
        subtitle="Genki-inspired learning through structured decks, kana drills, and steady review."
      >
        <HomeClient lessons={lessons} />
      </PageShell>
      <Footer />
    </>
  );
}
