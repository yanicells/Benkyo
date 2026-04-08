import { redirect } from "next/navigation";
import readingsData from "@/data/reading.json";
import { ReadingSessionRenderer } from "@/components/reading/reading-session-renderer";
import type { ReadingsData, ReadingDifficulty } from "@/lib/types";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const validDifficulties = new Set<string>(["simple", "intermediate", "hard"]);

function firstParam(
  v: string | string[] | undefined,
): string {
  return Array.isArray(v) ? v[0] ?? "" : v ?? "";
}

export default async function ReadingSessionPage({ searchParams }: Props) {
  const query = await searchParams;
  const rawDifficulty = firstParam(query.difficulty);

  if (!validDifficulties.has(rawDifficulty)) {
    redirect("/reading");
  }

  const difficulty = rawDifficulty as ReadingDifficulty;
  const allPassages = (readingsData as unknown as ReadingsData).passages;
  const passages = allPassages.filter((p) => p.difficulty === difficulty);

  if (passages.length === 0) {
    redirect("/reading");
  }

  return (
    <ReadingSessionRenderer
      passages={passages}
      difficulty={difficulty}
    />
  );
}
