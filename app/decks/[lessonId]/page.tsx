import Link from "next/link";
import { redirect } from "next/navigation";

import lessonsData from "@/data/lessons.json";
import { PageShell } from "@/components/shared/page-shell";
import type { FlipSetting, LessonsData, StudyMode } from "@/lib/types";

type DeckConfigPageProps = {
  params: Promise<{ lessonId: string }>;
};

const modeOptions: { value: StudyMode; label: string; description: string }[] =
  [
    {
      value: "flashcard",
      label: "Flashcard",
      description: "Reveal answer manually and self-grade.",
    },
    {
      value: "multiple-choice",
      label: "Multiple Choice",
      description: "Pick from randomized options quickly.",
    },
    {
      value: "typing",
      label: "Typing",
      description: "Type answers character by character.",
    },
  ];

const flipOptions: { value: FlipSetting; label: string }[] = [
  { value: "jp-to-en", label: "Japanese → English" },
  { value: "en-to-jp", label: "English → Japanese" },
];

export default async function DeckConfigPage({ params }: DeckConfigPageProps) {
  const { lessonId } = await params;
  const lessons = (lessonsData as LessonsData).lessons;
  const lesson = lessons.find((item) => item.id === lessonId);

  if (!lesson) {
    redirect("/decks");
  }

  return (
    <PageShell
      eyebrow="Session setup"
      title={lesson.title}
      subtitle="Pick study mode and direction. Settings are passed in URL params."
      backHref="/decks"
    >
      <form action={`/decks/${lessonId}/session`} className="space-y-6">
        <section className="rounded-2xl border border-rose-900/10 bg-white/70 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-rose-700">
            Study mode
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {modeOptions.map((mode) => (
              <label
                key={mode.value}
                className="flex cursor-pointer flex-col gap-2 rounded-2xl border border-rose-900/15 bg-white p-4 transition hover:border-rose-700/40"
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="mode"
                    value={mode.value}
                    defaultChecked={mode.value === "flashcard"}
                  />
                  <span className="font-semibold text-slate-900">
                    {mode.label}
                  </span>
                </span>
                <span className="text-sm text-slate-700">
                  {mode.description}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-rose-900/10 bg-white/70 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-rose-700">
            Direction
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {flipOptions.map((flip) => (
              <label
                key={flip.value}
                className="flex cursor-pointer items-center gap-2 rounded-2xl border border-rose-900/15 bg-white p-4 transition hover:border-rose-700/40"
              >
                <input
                  type="radio"
                  name="flip"
                  value={flip.value}
                  defaultChecked={flip.value === "jp-to-en"}
                />
                <span className="font-semibold text-slate-900">
                  {flip.label}
                </span>
              </label>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-slate-700"
          >
            Start session
          </button>
          <Link
            href="/decks"
            className="rounded-full border border-rose-900/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-rose-800 transition hover:border-rose-900/40 hover:bg-rose-100"
          >
            Back to deck list
          </Link>
        </div>
      </form>
    </PageShell>
  );
}
