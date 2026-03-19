import { redirect } from "next/navigation";

import lessonsData from "@/data/lessons.json";
import { PageShell } from "@/components/shared/page-shell";
import { SubDeckConfigClient } from "@/components/decks/sub-deck-config-client";
import type { LessonsData } from "@/lib/types";

type SubDeckConfigPageProps = {
  params: Promise<{ lessonId: string; subDeckId: string }>;
};

export default async function SubDeckConfigPage({
  params,
}: SubDeckConfigPageProps) {
  const { lessonId, subDeckId } = await params;
  const lessons = (lessonsData as unknown as LessonsData).lessons;
  const lesson = lessons.find((item) => item.id === lessonId);

  if (!lesson) {
    redirect("/decks");
  }

  // "all" is a special sub-deck ID that combines all cards
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

  const title = isStudyAll ? `${lesson.title} — All Cards` : subDeck!.title;
  const cardTypes = [...new Set(cards.map((c) => c.type))];

  return (
    <PageShell
      eyebrow="Session setup"
      title={title}
      subtitle={`${cards.length} cards available. Pick study mode, direction, and card type filters.`}
      backHref={`/decks/${lessonId}`}
    >
      <SubDeckConfigClient
        lessonId={lessonId}
        subDeckId={subDeckId}
        cardTypes={cardTypes}
      />

      <section className="mt-6 rounded-2xl border border-rose-900/10 bg-white p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-[0.22em] text-rose-700">
            Card preview
          </p>
          <p className="text-xs text-slate-600">{cards.length} entries</p>
        </div>
        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {cards.map((card, i) => (
            <div
              key={`${card.front}-${card.back}-${i}`}
              className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
            >
              <span className="mt-0.5 shrink-0 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-700">
                {card.type}
              </span>
              <div className="min-w-0">
                <p className="font-display text-xl text-slate-900">
                  {card.front}
                </p>
                <p className="mt-1 text-sm text-slate-700">{card.back}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
