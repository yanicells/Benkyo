import { redirect } from "next/navigation";

import lessonsData from "@/data/lessons.json";
import { SubDeckStudyClient } from "@/components/decks/sub-deck-study-client";
import type { LessonsData } from "@/lib/types";

type SubDeckConfigPageProps = {
  params: Promise<{ lessonId: string; subDeckId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SubDeckConfigPage({
  params,
  searchParams,
}: SubDeckConfigPageProps) {
  const { lessonId, subDeckId } = await params;
  const query = await searchParams;
  const fromParam = Array.isArray(query.from) ? query.from[0] : query.from;
  const fromKanjiDeck = fromParam === "kanji" || lessonId.startsWith("jlpt-");
  const lessons = (lessonsData as unknown as LessonsData).lessons;
  const lesson = lessons.find((item) => item.id === lessonId);

  if (!lesson) {
    redirect("/decks");
  }

  const isStudyAll = subDeckId === "all";
  const subDeck = isStudyAll
    ? null
    : lesson.subDecks.find((sd) => sd.id === subDeckId);

  if (!isStudyAll && !subDeck) {
    redirect(`/decks/${lessonId}`);
  }

  const cards = isStudyAll
    ? lesson.subDecks.flatMap((sd) => sd.cards)
    : subDeck!.cards;

  const progressCardRefs = isStudyAll
    ? lesson.subDecks.flatMap((sd) =>
        sd.cards.map((_, cardIndex) => ({
          subDeckId: sd.id,
          cardIndex,
        })),
      )
    : subDeck!.cards.map((_, cardIndex) => ({
        subDeckId: subDeck!.id,
        cardIndex,
      }));

  const title = isStudyAll ? `${lesson.title} — All Cards` : subDeck!.title;
  const cardTypes = [...new Set(cards.map((c) => c.type))];
  // For JLPT lessons, back goes to the JLPT lesson page (which shows the parts)
  // so users can pick another part. For other kanji decks, back to /decks/kanji.
  const backHref = lessonId.startsWith("jlpt-")
    ? `/decks/${lessonId}?from=kanji`
    : fromKanjiDeck
      ? "/decks/kanji"
      : `/decks/${lessonId}`;
  const backLabel = lessonId.startsWith("jlpt-")
    ? lesson.title
    : fromKanjiDeck
      ? "Kanji Decks"
      : lesson.title;

  return (
    <SubDeckStudyClient
      lessonId={lessonId}
      subDeckId={subDeckId}
      title={title}
      lessonTitle={lesson.title}
      backHref={backHref}
      backLabel={backLabel}
      cardCount={cards.length}
      cardTypes={cardTypes}
      meta={lesson.meta ?? null}
      cards={cards}
      progressCardRefs={progressCardRefs}
    />
  );
}
