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

const groupOrder: KanaGroup[] = ["basic", "dakuten", "combo"];
const batchOptions: KanaBatchSize[] = [1, 2, 3, 4];
const defaultBasicRows = getKanaRows("hiragana")
  .filter((row) => row.group === "basic")
  .map((row) => row.key);

const groupTitles: Record<KanaGroup, string> = {
  basic: "Basic",
  dakuten: "Dakuten",
  combo: "Combo",
};

function getOpenState(
  group: KanaGroup,
  openGroups: Record<KanaGroup, boolean>,
): boolean {
  if (group === "combo") {
    return openGroups.combo;
  }

  return openGroups.basic;
}

type PreviewRow = {
  label: string;
  entries: KanaEntry[];
};

export function KanaConfigForm() {
  const router = useRouter();
  const [script, setScript] = useState<KanaScript>("hiragana");
  const [selectedRows, setSelectedRows] =
    useState<KanaRowKey[]>(defaultBasicRows);
  const [batchSize, setBatchSize] = useState<KanaBatchSize>(1);
  const [openGroups, setOpenGroups] = useState<Record<KanaGroup, boolean>>({
    basic: false,
    dakuten: false,
    combo: false,
  });
  const [previewRow, setPreviewRow] = useState<PreviewRow | null>(null);

  const groupedRows = useMemo(() => {
    const rows = getKanaRows(script);

    return groupOrder.map((group) => ({
      group,
      rows: rows.filter((row) => row.group === group),
    }));
  }, [script]);

  const canStart = selectedRows.length > 0;

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
      if (previous.includes(row)) {
        return previous.filter((value) => value !== row);
      }
      return [...previous, row];
    });
  };

  const toggleOpenGroup = (group: KanaGroup) => {
    setOpenGroups((previous) => {
      if (group === "combo") {
        return {
          ...previous,
          combo: !previous.combo,
        };
      }

      const nextOpen = !previous.basic;

      return {
        ...previous,
        basic: nextOpen,
        dakuten: nextOpen,
      };
    });
  };

  const startSession = () => {
    if (!canStart) {
      return;
    }

    const serializedGroups = selectedRows.join(",");
    router.push(
      `/kana/session?script=${script}&groups=${serializedGroups}&batch=${batchSize}`,
    );
  };

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-rose-900/10 bg-white p-4 sm:p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-rose-700">
          Script
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setScript("hiragana")}
            className={`rounded-xl border px-4 py-3 text-left transition ${
              script === "hiragana"
                ? "border-rose-700 bg-rose-100"
                : "border-slate-300 bg-white hover:border-slate-500"
            }`}
          >
            <p className="font-display text-2xl text-slate-900">Hiragana</p>
          </button>
          <button
            type="button"
            onClick={() => setScript("katakana")}
            className={`rounded-xl border px-4 py-3 text-left transition ${
              script === "katakana"
                ? "border-rose-700 bg-rose-100"
                : "border-slate-300 bg-white hover:border-slate-500"
            }`}
          >
            <p className="font-display text-2xl text-slate-900">Katakana</p>
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-rose-900/10 bg-white p-4 sm:p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-rose-700">
          Practice size
        </p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {batchOptions.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setBatchSize(size)}
              className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                batchSize === size
                  ? "border-rose-700 bg-rose-100 text-rose-900"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-500"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-600">
          Shows {batchSize} kana at a time and scales total reps to {batchSize}
          x.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {groupedRows.map(({ group, rows }) => {
          const allSelected = rows.every((row) =>
            selectedRows.includes(row.key),
          );
          const isOpen = getOpenState(group, openGroups);

          return (
            <section
              key={group}
              className={`rounded-2xl border border-rose-900/10 bg-white p-4 sm:p-5 ${
                group === "combo" ? "sm:col-span-2" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => toggleGroup(group)}
                    className="h-4 w-4"
                  />
                  <span className="font-display text-2xl text-slate-900">
                    {groupTitles[group]}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => toggleOpenGroup(group)}
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-700 hover:underline"
                >
                  {isOpen ? "Hide" : "Customize"}
                </button>
              </div>

              {isOpen ? (
                <div className="mt-3 grid gap-2 border-t border-rose-900/10 pt-3">
                  {rows.map((row) => {
                    const checked = selectedRows.includes(row.key);

                    return (
                      <div
                        key={row.key}
                        className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-sm transition ${
                          checked
                            ? "border-rose-700 bg-rose-50"
                            : "border-slate-300 bg-white hover:border-slate-500"
                        }`}
                      >
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleRow(row.key)}
                            className="h-4 w-4"
                          />
                          <span className="font-display text-xl text-slate-800">
                            {row.label}
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewRow({
                              label: row.label,
                              entries: row.entries,
                            })
                          }
                          className="shrink-0 rounded-full border border-rose-900/20 p-2.5 text-rose-700 transition hover:border-rose-900/40 hover:bg-rose-50"
                          aria-label={`Preview ${row.label}`}
                          title={`Preview ${row.label}`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-5 w-5"
                            aria-hidden="true"
                          >
                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      <div className="flex items-center justify-end">
        <button
          type="button"
          disabled={!canStart}
          onClick={startSession}
          className="rounded-full bg-slate-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:text-sm"
        >
          Start kana session
        </button>
      </div>

      {previewRow ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setPreviewRow(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-rose-900/15 bg-white p-5 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-rose-700">
              Answer key
            </p>
            <h3 className="mt-2 font-display text-3xl text-slate-900">
              {previewRow.label}
            </h3>
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {previewRow.entries.map((entry) => (
                <div
                  key={`${entry.kana}-${entry.romaji}`}
                  className="rounded-xl border border-slate-200 bg-white p-2 text-center"
                >
                  <p className="font-display text-3xl text-slate-900">
                    {entry.kana}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{entry.romaji}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewRow(null)}
                className="min-h-11 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
