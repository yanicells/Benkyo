"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { KanaGroup, KanaScript } from "@/lib/types";

const groupOptions: { value: KanaGroup; label: string; description: string }[] = [
  { value: "basic", label: "Basic", description: "Core gojuon rows" },
  { value: "dakuten", label: "Dakuten", description: "Voiced and p-sound kana" },
  { value: "combo", label: "Combo", description: "Small-ya/yu/yo combinations" },
];

export function KanaConfigForm() {
  const router = useRouter();
  const [script, setScript] = useState<KanaScript>("hiragana");
  const [groups, setGroups] = useState<KanaGroup[]>(["basic"]);

  const canStart = useMemo(() => groups.length > 0, [groups.length]);

  const toggleGroup = (group: KanaGroup) => {
    setGroups((previous) => {
      if (previous.includes(group)) {
        return previous.filter((value) => value !== group);
      }
      return [...previous, group];
    });
  };

  const startSession = () => {
    if (!canStart) {
      return;
    }
    const serializedGroups = groups.join(",");
    router.push(`/kana/session?script=${script}&groups=${serializedGroups}`);
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-rose-900/10 bg-white/70 p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-rose-700">Script</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setScript("hiragana")}
            className={`rounded-2xl border px-4 py-3 text-left transition ${
              script === "hiragana"
                ? "border-rose-700 bg-rose-100"
                : "border-rose-900/20 bg-white hover:border-rose-700/40"
            }`}
          >
            <p className="font-semibold text-slate-900">Hiragana</p>
            <p className="text-sm text-slate-700">Native Japanese phonetic script</p>
          </button>
          <button
            type="button"
            onClick={() => setScript("katakana")}
            className={`rounded-2xl border px-4 py-3 text-left transition ${
              script === "katakana"
                ? "border-rose-700 bg-rose-100"
                : "border-rose-900/20 bg-white hover:border-rose-700/40"
            }`}
          >
            <p className="font-semibold text-slate-900">Katakana</p>
            <p className="text-sm text-slate-700">Used for loanwords and emphasis</p>
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-rose-900/10 bg-white/70 p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-rose-700">Character groups</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {groupOptions.map((option) => {
            const checked = groups.includes(option.value);

            return (
              <label
                key={option.value}
                className={`flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 transition ${
                  checked
                    ? "border-rose-700 bg-rose-100"
                    : "border-rose-900/20 bg-white hover:border-rose-700/40"
                }`}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleGroup(option.value)}
                    className="h-4 w-4 rounded border-rose-900/30"
                  />
                  <span className="font-semibold text-slate-900">{option.label}</span>
                </span>
                <span className="text-sm text-slate-700">{option.description}</span>
              </label>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        disabled={!canStart}
        onClick={startSession}
        className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        Start kana session
      </button>
    </section>
  );
}
