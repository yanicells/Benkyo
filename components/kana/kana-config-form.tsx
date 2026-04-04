"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getKanaRows } from "@/lib/kana";
import type {
  KanaBatchSize,
  KanaGroup,
  KanaRowKey,
  KanaScript,
} from "@/lib/types";

type KanaConfigFormProps = {
  initialScript?: KanaScript;
};

const groupOrder: KanaGroup[] = ["basic", "dakuten", "combo"];

export function KanaConfigForm({
  initialScript = "hiragana",
}: KanaConfigFormProps) {
  const router = useRouter();
  const [script, setScript] = useState<KanaScript>(initialScript);
  const [selectedRows, setSelectedRows] = useState<KanaRowKey[]>(() =>
    getKanaRows(initialScript)
      .filter((row) => row.group === "basic")
      .map((row) => row.key),
  );
  const [batchSize, setBatchSize] = useState<KanaBatchSize>(3);
  const [shuffleOrder, setShuffleOrder] = useState(true);
  const [mode, setMode] = useState<"mc" | "typing">("mc");

  const groupedRows = useMemo(() => {
    const rows = getKanaRows(script);
    return groupOrder.map((group) => ({
      group,
      rows: rows.filter((row) => row.group === group),
    }));
  }, [script]);

  // Script-aware group descriptions — derived from selection, not editorial copy
  const scriptLabel = script === "hiragana" ? "Hiragana" : "Katakana";
  const groupInfo: Record<KanaGroup, { eyebrow: string; title: string; desc: string }> = {
    basic: {
      eyebrow: "FOUNDATION",
      title: "Basic",
      desc: `Core ${scriptLabel} characters — vowels, K, S, T, N, H, M, Y, R, W rows.`,
    },
    dakuten: {
      eyebrow: "MODIFIED",
      title: "Dakuten",
      desc: `Voiced ${scriptLabel} variants — G, Z, D, B, and P rows.`,
    },
    combo: {
      eyebrow: "COMPLEX",
      title: "Combo",
      desc: `Contracted ${scriptLabel} sounds — Kya, Sha, Cha, Ryu, etc.`,
    },
  };

  // Real card count from selected rows' entries
  const { cardCount, rowCount } = useMemo(() => {
    const allRows = getKanaRows(script);
    const active = allRows.filter((row) => selectedRows.includes(row.key));
    return {
      cardCount: active.reduce((sum, row) => sum + row.entries.length, 0),
      rowCount: active.length,
    };
  }, [script, selectedRows]);

  // Duration estimate: MC ~5s/card, typing ~8s/card
  const estimatedMinutes = Math.max(
    1,
    Math.round((cardCount * (mode === "typing" ? 8 : 5)) / 60),
  );

  const toggleGroup = (group: KanaGroup) => {
    const groupRows =
      groupedRows.find((item) => item.group === group)?.rows ?? [];
    const groupKeys = groupRows.map((row) => row.key);

    setSelectedRows((previous) => {
      const allSelected = groupKeys.every((key) => previous.includes(key));
      if (allSelected) {
        return previous.filter((key) => !groupKeys.includes(key));
      }
      return Array.from(new Set([...previous, ...groupKeys]));
    });
  };

  const toggleRow = (row: KanaRowKey) => {
    setSelectedRows((previous) => {
      if (previous.includes(row))
        return previous.filter((value) => value !== row);
      return [...previous, row];
    });
  };

  const selectAll = () => {
    const activeGroups = groupOrder.filter((group) => {
      const groupRows =
        groupedRows.find((item) => item.group === group)?.rows ?? [];
      return groupRows.some((r) => selectedRows.includes(r.key));
    });
    const rowsToSelect = groupedRows
      .filter((g) =>
        activeGroups.length === 0
          ? g.group === "basic"
          : activeGroups.includes(g.group),
      )
      .flatMap((g) => g.rows.map((r) => r.key));
    setSelectedRows(Array.from(new Set([...selectedRows, ...rowsToSelect])));
  };

  const startSession = () => {
    if (selectedRows.length === 0) return;
    const serializedGroups = selectedRows.join(",");
    router.push(
      `/kana/session?script=${script}&groups=${serializedGroups}&batch=${batchSize}&shuffle=${shuffleOrder}&mode=${mode}`,
    );
  };

  return (
    <div className="space-y-8">
      {/* Script Segmented Control */}
      <div className="flex rounded-xl bg-surface-lowest p-1 shadow-sm">
        <button
          className={`flex-1 rounded-lg py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${script === "hiragana" ? "bg-white shadow-sm text-primary" : "text-on-surface-variant hover:bg-surface-low"}`}
          onClick={() => setScript("hiragana")}
        >
          <span className="font-japanese-display text-lg">あ</span> Hiragana
        </button>
        <button
          className={`flex-1 rounded-lg py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${script === "katakana" ? "bg-white shadow-sm text-primary" : "text-on-surface-variant hover:bg-surface-low"}`}
          onClick={() => setScript("katakana")}
        >
          <span className="font-japanese-display text-lg">ア</span> Katakana
        </button>
      </div>

      {/* Group Cards */}
      <div className="space-y-3">
        {groupOrder.map((group) => {
          const rows = groupedRows.find((g) => g.group === group)?.rows ?? [];
          const allSelected = rows.every((r) => selectedRows.includes(r.key));
          const someSelected = rows.some((r) => selectedRows.includes(r.key));
          const isActive = allSelected || someSelected;

          return (
            <button
              key={group}
              onClick={() => toggleGroup(group)}
              className={`w-full text-left rounded-xl p-5 transition-all relative ${
                isActive
                  ? "bg-surface-lowest border-[1.5px] border-primary shadow-sm"
                  : "bg-surface-lowest/60 border-[1.5px] border-transparent hover:bg-surface-lowest"
              }`}
            >
              {isActive && (
                <div className="absolute top-4 right-4 text-primary">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path
                      fill="white"
                      d="M10 15.5l-3.5-3.5 1.4-1.4 2.1 2.1 5.6-5.6 1.4 1.4L10 15.5z"
                    />
                  </svg>
                </div>
              )}
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-on-surface-variant mb-1">
                {groupInfo[group].eyebrow}
              </h4>
              <p className="font-display text-xl font-bold text-foreground mb-1">
                {groupInfo[group].title}
              </p>
              <p className="text-xs text-on-surface-variant leading-relaxed opacity-80">
                {groupInfo[group].desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Rows Selection */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs uppercase tracking-[0.2em] font-extrabold text-foreground">
            Select Rows
          </h3>
          <button
            onClick={selectAll}
            className="text-xs font-bold text-primary hover:underline"
          >
            Select All
          </button>
        </div>

        <div className="space-y-2">
          {groupedRows.map((g) => {
            const hasAnySelectedInGroup = g.rows.some((r) =>
              selectedRows.includes(r.key),
            );
            if (!hasAnySelectedInGroup && g.group !== "basic") return null;

            return g.rows.map((row) => {
              const checked = selectedRows.includes(row.key);
              const firstKana = row.entries[0]?.kana || "";

              return (
                <div
                  key={row.key}
                  className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${checked ? "bg-surface-lowest shadow-sm" : "bg-surface-lowest/50 opacity-60"}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center font-japanese-display text-lg font-bold text-primary">
                    {firstKana}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-foreground">
                      {row.label}
                    </p>
                    <p className="text-[10px] text-on-surface-variant">
                      {row.entries.map((e) => e.romaji).join(", ")}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleRow(row.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-primary" : "bg-outline-variant/30"}`}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </button>
                </div>
              );
            });
          })}
        </div>
      </div>

      {/* Session Options */}
      <div>
        <h3 className="text-xs uppercase tracking-[0.2em] font-extrabold text-foreground mb-4">
          Session Options
        </h3>
        <div className="rounded-xl bg-surface-lowest p-5 shadow-sm space-y-6">
          {/* Study Mode */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">
              Study Mode
            </p>
            <div className="flex rounded-xl bg-surface p-1">
              <button
                onClick={() => setMode("mc")}
                className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-colors ${mode === "mc" ? "bg-white shadow-sm text-primary" : "text-on-surface-variant hover:bg-surface-low"}`}
              >
                Multiple Choice
              </button>
              <button
                onClick={() => setMode("typing")}
                className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-colors ${mode === "typing" ? "bg-white shadow-sm text-primary" : "text-on-surface-variant hover:bg-surface-low"}`}
              >
                Typing
              </button>
            </div>
          </div>

          {/* Batch Size — typing mode only */}
          {mode === "typing" && (
            <div className="border-t border-outline-variant/10 pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold text-foreground">
                  Batch Size
                </span>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-bold">
                  {batchSize} Kana
                </span>
              </div>
              <div className="relative pt-2 pb-6">
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={batchSize}
                  onChange={(e) =>
                    setBatchSize(Number(e.target.value) as KanaBatchSize)
                  }
                  className="w-full h-1.5 bg-secondary-container rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-0 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-primary"
                  style={{
                    background: `linear-gradient(to right, var(--primary) ${((batchSize - 1) / 3) * 100}%, var(--secondary-container) ${((batchSize - 1) / 3) * 100}%)`,
                  }}
                />
                <div className="absolute w-full flex justify-between px-1 text-[10px] font-semibold text-on-surface-variant top-8">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                </div>
              </div>
            </div>
          )}

          {/* Shuffle Order */}
          <div className="pt-2 border-t border-outline-variant/10 flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Shuffle Order
              </p>
              <p className="text-[10px] text-on-surface-variant mt-0.5">
                Randomize Kana sequence each session
              </p>
            </div>
            <button
              onClick={() => setShuffleOrder(!shuffleOrder)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${shuffleOrder ? "bg-primary" : "bg-outline-variant/30"}`}
            >
              <span
                className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform ${shuffleOrder ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Session preview — real card count and estimated duration from selection */}
      {selectedRows.length > 0 ? (
        <div className="rounded-xl bg-surface-lowest p-5 shadow-sm border border-outline-variant/20">
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-on-surface-variant mb-4">
            Session Preview
          </p>
          <div className="flex items-center gap-5">
            <div className="text-center min-w-12">
              <p className="font-display text-3xl font-bold text-foreground leading-none">
                {cardCount}
              </p>
              <p className="text-[10px] uppercase text-on-surface-variant mt-1">
                kana
              </p>
            </div>
            <div className="h-10 w-px bg-outline-variant/30 shrink-0" />
            <div className="text-center min-w-12">
              <p className="font-display text-3xl font-bold text-foreground leading-none">
                ~{estimatedMinutes}
              </p>
              <p className="text-[10px] uppercase text-on-surface-variant mt-1">
                min
              </p>
            </div>
            <div className="h-10 w-px bg-outline-variant/30 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground leading-snug">
                {rowCount} row{rowCount !== 1 ? "s" : ""} selected
              </p>
              <p className="text-[10px] text-on-surface-variant mt-0.5">
                {scriptLabel} · {mode === "typing" ? "Typing" : "Multiple Choice"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-surface-lowest/60 p-5 text-center border border-outline-variant/20">
          <p className="text-sm text-on-surface-variant">
            Select at least one row to begin.
          </p>
        </div>
      )}

      <div className="pb-8">
        <button
          type="button"
          disabled={selectedRows.length === 0}
          onClick={startSession}
          className="w-full btn-primary-gradient flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label={
            selectedRows.length === 0
              ? "Select rows to enable session start"
              : `Start ${scriptLabel} session — ${cardCount} cards, ~${estimatedMinutes} min`
          }
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
          Start Kana Session
        </button>
      </div>
    </div>
  );
}
