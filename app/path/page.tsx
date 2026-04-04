import type { Metadata } from "next";
import { LearningPathClient } from "@/components/path/learning-path-client";
import { PageShell } from "@/components/shared/page-shell";
import lessonsData from "@/data/lessons.json";
import type { LessonsData } from "@/lib/types";

export const metadata: Metadata = {
  title: "Learning Path",
};

export default function PathPage() {
  const { lessons } = lessonsData as LessonsData;
  // Sort by order field, fallback to array index
  const sorted = [...lessons].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  return (
    <PageShell title="Learning Path">
      <LearningPathClient lessons={sorted} />
    </PageShell>
  );
}
