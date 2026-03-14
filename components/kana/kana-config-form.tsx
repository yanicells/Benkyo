"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getKanaRows } from "@/lib/kana";
import type { KanaGroup, KanaRowKey, KanaScript } from "@/lib/types";

const groupOrder: KanaGroup[] = ["basic", "dakuten", "combo"];

const groupTitles: Record<KanaGroup, string> = {
  basic: "Basic",
  dakuten: "Dakuten",
  combo: "Combo",
};

export function KanaConfigForm() {
  const router = useRouter();
  const [script, setScript] = useState<KanaScript>("hiragana");
  const [selectedRows, setSelectedRows] = useState<KanaRowKey[]>(["basic-a"]);

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

  const startSession = () => {
    if (!canStart) {
      return;
    }

    const serializedGroups = selectedRows.join(",");
    router.push(`/kana/session?script=${script}&groups=${serializedGroups}`);
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
                : "border-rose-900/20 bg-white hover:border-rose-700/40"
            }`}
          >
            <p className="font-semibold text-slate-900">Hiragana</p>
          </button>
          <button
            type="button"
            onClick={() => setScript("katakana")}
            className={`rounded-xl border px-4 py-3 text-left transition ${
              script === "katakana"
                ? "border-rose-700 bg-rose-100"
                : "border-rose-900/20 bg-white hover:border-rose-700/40"
            }`}
          >
            <p className="font-semibold text-slate-900">Katakana</p>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {groupedRows.map(({ group, rows }) => {
          const allSelected = rows.every((row) =>
            selectedRows.includes(row.key),
          );

          return (
            <section
              key={group}
              className="rounded-2xl border border-rose-900/10 bg-white p-4 sm:p-5"
            >
              <label className="mb-3 flex cursor-pointer items-center gap-2 border-b border-rose-900/10 pb-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => toggleGroup(group)}
                  className="h-4 w-4"
                />
                <span className="font-semibold text-slate-900">
                  {groupTitles[group]}
                </span>
              </label>

              <div className="grid gap-2">
                {rows.map((row) => {
                  const checked = selectedRows.includes(row.key);

                  return (
                    <label
                      key={row.key}
                      className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-sm transition ${
                        checked
                          ? "border-rose-700 bg-rose-50"
                          : "border-rose-900/20 bg-white hover:border-rose-700/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleRow(row.key)}
                        className="mt-0.5 h-4 w-4"
                      />
                      <span className="text-slate-800">{row.label}</span>
                    </label>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!canStart}
        onClick={startSession}
        className="rounded-full bg-slate-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:text-sm"
      >
        Start kana session
      </button>
    </section>
  );
}
