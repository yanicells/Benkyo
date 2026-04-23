"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getKanaRows } from "@/lib/kana";
import type {
  KanaBatchSize,
  KanaEntry,
  KanaGroup,
  KanaRowKey,
  KanaScript,
} from "@/lib/types";

type TabValue = KanaScript;

type KanaConfigFormProps = {
  initialScript?: KanaScript;
  initialTab?: TabValue;
};

const groupOrder: KanaGroup[] = ["basic", "dakuten", "combo"];

/* ── Row Preview Modal ── */
function RowPreviewModal({
  label,
  entries,
  onClose,
}: {
  label: string;
  entries: KanaEntry[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex max-h-[75vh] sm:max-h-[80vh] w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-surface-lowest shadow-[0_24px_64px_rgba(0,14,33,0.2)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/10">
          <h3 className="font-display text-base font-bold text-foreground">
            {label}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-low transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto p-5 grid grid-cols-5 gap-3">
          {entries.map((entry) => (
            <div
              key={entry.kana}
              className="flex flex-col items-center gap-1.5 rounded-xl bg-surface-low p-2"
            >
              <span className="font-japanese-display text-3xl text-foreground leading-none">
                {entry.kana}
              </span>
              <span className="text-[10px] font-bold text-on-surface-variant tracking-wider">
                {entry.romaji}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Session Options Modal ── */
function SessionOptionsModal({
  mode,
  setMode,
  typingDifficulty,
  setTypingDifficulty,
  batchSize,
  setBatchSize,
  shuffleOrder,
  setShuffleOrder,
  cardCount,
  estimatedMinutes,
  rowCount,
  onStart,
  onClose,
}: {
  mode: "mc" | "typing";
  setMode: (m: "mc" | "typing") => void;
  typingDifficulty: "easy" | "hard";
  setTypingDifficulty: (value: "easy" | "hard") => void;
  batchSize: KanaBatchSize;
  setBatchSize: (b: KanaBatchSize) => void;
  shuffleOrder: boolean;
  setShuffleOrder: (v: boolean) => void;
  cardCount: number;
  estimatedMinutes: number;
  rowCount: number;
  onStart: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex max-h-[75vh] sm:max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-surface-lowest shadow-[0_24px_64px_rgba(0,14,33,0.2)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10 shrink-0">
          <h3 className="font-display text-lg font-bold text-foreground">
            Session Settings
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-low transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-5">
          {/* Session summary */}
          <div className="rounded-xl border-2 border-primary/20 bg-surface-lowest px-5 py-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="font-display text-2xl font-bold text-foreground">
                  {cardCount}
                </p>
                <p className="text-[10px] uppercase tracking-[0.12em] text-on-surface-variant mt-0.5">
                  kana
                </p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-foreground">
                  ~{estimatedMinutes}
                </p>
                <p className="text-[10px] uppercase tracking-[0.12em] text-on-surface-variant mt-0.5">
                  min
                </p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-foreground">
                  {rowCount}
                </p>
                <p className="text-[10px] uppercase tracking-[0.12em] text-on-surface-variant mt-0.5">
                  row{rowCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Study mode */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-3">
              Study mode{" "}
              <span className="text-on-surface-variant">(Select 1)</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["mc", "typing"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
                    mode === m
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-primary/20 bg-surface-lowest text-foreground hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  {m === "mc" ? "Multiple Choice" : "Typing"}
                </button>
              ))}
            </div>
          </div>

          {/* Batch size — typing only */}
          {mode === "typing" && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
                  Batch Size
                </p>
                <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                  {batchSize} Kana
                </span>
              </div>
              <div className="relative pt-1 pb-5">
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={batchSize}
                  onChange={(e) =>
                    setBatchSize(Number(e.target.value) as KanaBatchSize)
                  }
                  className="w-full h-1.5 bg-secondary-container rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-primary"
                  style={{
                    background: `linear-gradient(to right, var(--primary) ${((batchSize - 1) / 3) * 100}%, var(--secondary-container) ${((batchSize - 1) / 3) * 100}%)`,
                  }}
                />
                <div className="absolute w-full flex justify-between px-1 text-[10px] font-semibold text-on-surface-variant top-7">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                </div>
              </div>
            </div>
          )}

          {/* Typing difficulty — typing only */}
          {mode === "typing" && (
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-3">
                Typing difficulty{" "}
                <span className="text-on-surface-variant">(Select 1)</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    {
                      key: "easy",
                      title: "Easy",
                      desc: "Mistakes show a red border",
                    },
                    {
                      key: "hard",
                      title: "Hard",
                      desc: "No live right/wrong feedback",
                    },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setTypingDifficulty(option.key)}
                    className={`rounded-xl border-2 px-3 py-3 text-left transition-all ${
                      typingDifficulty === option.key
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-primary/20 bg-surface-lowest text-foreground hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  >
                    <p className="text-sm font-bold">{option.title}</p>
                    <p className="mt-0.5 text-[10px] text-on-surface-variant">
                      {option.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Shuffle */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Shuffle Order
              </p>
              <p className="text-[10px] text-on-surface-variant mt-0.5">
                Randomize kana sequence
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShuffleOrder(!shuffleOrder)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors ${shuffleOrder ? "border-primary bg-primary" : "border-primary/20 bg-surface-low"}`}
            >
              <span
                className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform ${shuffleOrder ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>
        </div>

        {/* Start */}
        <div className="px-6 py-4 border-t border-outline-variant/10 shrink-0">
          <button
            type="button"
            onClick={onStart}
            className="w-full btn-primary-gradient rounded-xl py-4 text-white font-bold text-base shadow-[0_8px_24px_rgba(0,36,70,0.15)] transition hover:opacity-90 hover:shadow-lg"
          >
            Start Session
          </button>
        </div>
      </div>
    </div>
  );
}

export function KanaConfigForm({
  initialScript = "hiragana",
  initialTab = "hiragana",
}: KanaConfigFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);
  const [script, setScript] = useState<KanaScript>(initialScript);
  const [selectedRows, setSelectedRows] = useState<KanaRowKey[]>(() =>
    getKanaRows(initialScript)
      .filter((row) => row.group === "basic")
      .map((row) => row.key),
  );
  const [batchSize, setBatchSize] = useState<KanaBatchSize>(3);
  const [shuffleOrder, setShuffleOrder] = useState(true);
  const [mode, setMode] = useState<"mc" | "typing">("typing");
  const [typingDifficulty, setTypingDifficulty] = useState<"easy" | "hard">(
    "easy",
  );
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [previewRow, setPreviewRow] = useState<{
    label: string;
    entries: KanaEntry[];
  } | null>(null);

  const groupedRows = useMemo(() => {
    const rows = getKanaRows(script);
    return groupOrder.map((group) => ({
      group,
      rows: rows.filter((row) => row.group === group),
    }));
  }, [script]);

  const scriptLabel = script === "hiragana" ? "Hiragana" : "Katakana";

  const groupInfo: Record<
    KanaGroup,
    { eyebrow: string; title: string; desc: string }
  > = {
    basic: {
      eyebrow: "FOUNDATION",
      title: "Basic",
      desc: `Core ${scriptLabel} — vowels, K, S, T, N, H, M, Y, R, W rows.`,
    },
    dakuten: {
      eyebrow: "MODIFIED",
      title: "Dakuten",
      desc: `Voiced variants — G, Z, D, B, and P rows.`,
    },
    combo: {
      eyebrow: "COMPLEX",
      title: "Combo",
      desc: `Contracted sounds — Kya, Sha, Cha, Ryu, etc.`,
    },
  };

  const { cardCount, rowCount } = useMemo(() => {
    const allRows = getKanaRows(script);
    const active = allRows.filter((row) => selectedRows.includes(row.key));
    return {
      cardCount: active.reduce((sum, row) => sum + row.entries.length, 0),
      rowCount: active.length,
    };
  }, [script, selectedRows]);

  const estimatedMinutes = Math.max(
    1,
    Math.round((cardCount * (mode === "typing" ? 8 : 5)) / 60),
  );

  const toggleGroup = (group: KanaGroup) => {
    const groupRows =
      groupedRows.find((item) => item.group === group)?.rows ?? [];
    const groupKeys = groupRows.map((row) => row.key);
    setSelectedRows((prev) => {
      const allSelected = groupKeys.every((key) => prev.includes(key));
      if (allSelected) return prev.filter((key) => !groupKeys.includes(key));
      return Array.from(new Set([...prev, ...groupKeys]));
    });
  };

  const toggleRow = (row: KanaRowKey) => {
    setSelectedRows((prev) =>
      prev.includes(row) ? prev.filter((v) => v !== row) : [...prev, row],
    );
  };

  const startSession = () => {
    if (selectedRows.length === 0) return;
    const serializedGroups = selectedRows.join(",");
    router.push(
      `/kana/session?script=${script}&groups=${serializedGroups}&batch=${batchSize}&shuffle=${shuffleOrder}&mode=${mode}&typingDifficulty=${typingDifficulty}`,
    );
  };

  return (
    <>
      {/* Tab toggle */}
      <div className="flex rounded-xl border border-outline-variant/20 bg-surface-lowest p-1 shadow-sm">
        {(
          [
            { value: "hiragana" as TabValue, label: "Hiragana", icon: "あ" },
            { value: "katakana" as TabValue, label: "Katakana", icon: "ア" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.value}
            type="button"
            aria-pressed={activeTab === tab.value}
            onClick={() => {
              setActiveTab(tab.value);
              setScript(tab.value);
              setSelectedRows(
                getKanaRows(tab.value)
                  .filter((row) => row.group === "basic")
                  .map((row) => row.key),
              );
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-3 text-sm font-bold transition-all ${
              activeTab === tab.value
                ? "border-primary/35 bg-primary/[0.07] text-primary shadow-[0_6px_16px_rgba(0,36,70,0.08)]"
                : "border-transparent text-on-surface-variant hover:border-primary/20 hover:bg-primary/[0.02]"
            }`}
          >
            <span className="font-japanese-display text-lg">{tab.icon}</span>
            <span className="hidden [@media(min-width:400px)]:inline">
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Kana tab content */}
      {(
        <>
          <div className="mt-6 space-y-6 pb-32">
            {/* Group quick-select */}
            <div className="grid gap-2 [@media(min-width:560px)]:grid-cols-2 [@media(min-width:900px)]:grid-cols-3">
              {groupOrder.map((group) => {
                const rows =
                  groupedRows.find((g) => g.group === group)?.rows ?? [];
                const allSelected = rows.every((r) =>
                  selectedRows.includes(r.key),
                );
                const someSelected = rows.some((r) =>
                  selectedRows.includes(r.key),
                );
                const isActive = allSelected || someSelected;
                const statusLabel = allSelected
                  ? "Selected"
                  : someSelected
                    ? "Partial"
                    : "Tap to select";

                return (
                  <button
                    key={group}
                    type="button"
                    onClick={() => toggleGroup(group)}
                    aria-pressed={isActive}
                    className={`relative w-full rounded-xl border-2 p-4 text-left transition-all ${
                      isActive
                        ? "border-primary/35 bg-primary/[0.04] shadow-[0_6px_18px_rgba(0,36,70,0.08)]"
                        : "border-outline-variant/20 bg-surface-lowest/70 hover:border-primary/25 hover:bg-primary/[0.02]"
                    }`}
                  >
                    <div
                      className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] ${
                        allSelected
                          ? "bg-primary/15 text-primary"
                          : someSelected
                            ? "bg-secondary-container text-on-surface-variant"
                            : "bg-surface-low text-on-surface-variant/80"
                      }`}
                    >
                      {statusLabel}
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-0.5">
                      {groupInfo[group].eyebrow}
                    </p>
                    <p className="font-display text-base font-bold text-foreground">
                      {groupInfo[group].title}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                      {groupInfo[group].desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Row selection */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs uppercase tracking-[0.15em] font-bold text-foreground">
                  Select Rows
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedRows(getKanaRows(script).map((r) => r.key))
                  }
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Select All
                </button>
              </div>

              <div className="space-y-1.5">
                {groupedRows.map((g) => {
                  const hasAnySelectedInGroup = g.rows.some((r) =>
                    selectedRows.includes(r.key),
                  );
                  if (!hasAnySelectedInGroup && g.group !== "basic")
                    return null;

                  return g.rows.map((row) => {
                    const checked = selectedRows.includes(row.key);
                    const firstKana = row.entries[0]?.kana ?? "";

                    return (
                      <div
                        key={row.key}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                          checked
                            ? "bg-surface-lowest shadow-sm"
                            : "bg-surface-lowest/50 opacity-60"
                        }`}
                      >
                        {/* Kana preview — clickable */}
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewRow({
                              label: row.label,
                              entries: row.entries,
                            })
                          }
                          className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center font-japanese-display text-lg font-bold text-primary hover:bg-primary/10 transition-colors shrink-0"
                          title={`Preview ${row.label}`}
                        >
                          {firstKana}
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-foreground">
                            {row.label}
                          </p>
                          <p className="text-[10px] text-on-surface-variant truncate">
                            {row.entries.map((e) => e.romaji).join(", ")}
                          </p>
                        </div>

                        {/* Toggle */}
                        <button
                          type="button"
                          onClick={() => toggleRow(row.key)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                            checked ? "bg-primary" : "bg-outline-variant/30"
                          }`}
                        >
                          <span
                            className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform ${
                              checked ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    );
                  });
                })}
              </div>
            </div>
          </div>

          {/* Sticky bottom bar — Start Session CTA */}
          <div className="fixed bottom-16 left-0 right-0 lg:bottom-0 lg:left-72 z-30 bg-surface/95 backdrop-blur-md border-t border-outline-variant/10">
            <div className="mx-auto w-full max-w-4xl px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 sm:px-8">
              <button
                type="button"
                disabled={selectedRows.length === 0}
                onClick={() => setOptionsOpen(true)}
                className="w-full btn-primary-gradient rounded-xl py-3.5 text-white font-bold text-sm shadow-[0_8px_20px_rgba(0,36,70,0.15)] transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {selectedRows.length === 0
                  ? "Select rows to start"
                  : "Start Session"}
              </button>
            </div>
          </div>

          {/* Row preview modal */}
          {previewRow && (
            <RowPreviewModal
              label={previewRow.label}
              entries={previewRow.entries}
              onClose={() => setPreviewRow(null)}
            />
          )}

          {/* Session options modal */}
          {optionsOpen && (
            <SessionOptionsModal
              mode={mode}
              setMode={setMode}
              typingDifficulty={typingDifficulty}
              setTypingDifficulty={setTypingDifficulty}
              batchSize={batchSize}
              setBatchSize={setBatchSize}
              shuffleOrder={shuffleOrder}
              setShuffleOrder={setShuffleOrder}
              cardCount={cardCount}
              estimatedMinutes={estimatedMinutes}
              rowCount={rowCount}
              onStart={startSession}
              onClose={() => setOptionsOpen(false)}
            />
          )}
        </>
      )}
    </>
  );
}
