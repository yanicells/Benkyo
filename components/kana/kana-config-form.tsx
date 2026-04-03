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

const groupInfo: Record<KanaGroup, { title: string; eyebrow: string; desc: string }> = {
  basic: { eyebrow: "FOUNDATION", title: "Basic", desc: "The 46 essential characters from A to N." },
  dakuten: { eyebrow: "MODIFIED", title: "Dakuten", desc: "Voiced characters (Ga, Za, Da, Ba, Pa)." },
  combo: { eyebrow: "COMPLEX", title: "Combo", desc: "Contracted sounds like Kya, Sho, Ryu." },
};

export function KanaConfigForm() {
  const router = useRouter();
  const [script, setScript] = useState<KanaScript>("hiragana");
  const [selectedRows, setSelectedRows] = useState<KanaRowKey[]>(defaultBasicRows);
  const [batchSize, setBatchSize] = useState<KanaBatchSize>(3);
  const [shuffleOrder, setShuffleOrder] = useState(true);

  const groupedRows = useMemo(() => {
    const rows = getKanaRows(script);
    return groupOrder.map((group) => ({
      group,
      rows: rows.filter((row) => row.group === group),
    }));
  }, [script]);

  const toggleGroup = (group: KanaGroup) => {
    const groupRows = groupedRows.find((item) => item.group === group)?.rows ?? [];
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
      if (previous.includes(row)) return previous.filter((value) => value !== row);
      return [...previous, row];
    });
  };

  const selectAll = () => {
    const activeGroups = groupOrder.filter((group) => {
        const groupRows = groupedRows.find((item) => item.group === group)?.rows ?? [];
        return groupRows.some(r => selectedRows.includes(r.key));
    });
    // If we only have basic shown, just select all basic. But the UI in screenshot shows all rows for selected groups.
    const rowsToSelect = groupedRows
        .filter(g => activeGroups.length === 0 ? g.group === 'basic' : activeGroups.includes(g.group))
        .flatMap(g => g.rows.map(r => r.key));
    setSelectedRows(Array.from(new Set([...selectedRows, ...rowsToSelect])));
  };

  const startSession = () => {
    if (selectedRows.length === 0) return;
    const serializedGroups = selectedRows.join(",");
    router.push(`/kana/session?script=${script}&groups=${serializedGroups}&batch=${batchSize}&shuffle=${shuffleOrder}`);
  };

  return (
    <div className="space-y-8">
      {/* Script Segmented Control */}
      <div className="flex rounded-xl bg-surface-lowest p-1 shadow-sm">
        <button
          className={`flex-1 rounded-lg py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${script === 'hiragana' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:bg-surface-low'}`}
          onClick={() => setScript('hiragana')}
        >
          <span className="font-display text-lg">あ</span> Hiragana
        </button>
        <button
          className={`flex-1 rounded-lg py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${script === 'katakana' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:bg-surface-low'}`}
          onClick={() => setScript('katakana')}
        >
          <span className="font-display text-lg">ア</span> Katakana
        </button>
      </div>

      {/* Group Cards */}
      <div className="space-y-3">
        {groupOrder.map((group) => {
          const rows = groupedRows.find(g => g.group === group)?.rows ?? [];
          const allSelected = rows.every(r => selectedRows.includes(r.key));
          const someSelected = rows.some(r => selectedRows.includes(r.key));
          const isActive = allSelected || someSelected;

          return (
            <button
              key={group}
              onClick={() => toggleGroup(group)}
              className={`w-full text-left rounded-xl p-5 transition-all relative ${
                isActive 
                  ? 'bg-surface-lowest border-[1.5px] border-primary shadow-sm' 
                  : 'bg-surface-lowest/60 border-[1.5px] border-transparent hover:bg-surface-lowest'
              }`}
            >
              {isActive && (
                <div className="absolute top-4 right-4 text-primary">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path fill="white" d="M10 15.5l-3.5-3.5 1.4-1.4 2.1 2.1 5.6-5.6 1.4 1.4L10 15.5z" />
                  </svg>
                </div>
              )}
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-on-surface-variant mb-1">
                {groupInfo[group].eyebrow}
              </h4>
              <p className="font-display text-xl font-bold text-foreground mb-1">{groupInfo[group].title}</p>
              <p className="text-xs text-on-surface-variant leading-relaxed opacity-80">{groupInfo[group].desc}</p>
            </button>
          )
        })}
      </div>

      {/* Rows Selection */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs uppercase tracking-[0.2em] font-extrabold text-foreground">Select Rows</h3>
          <button onClick={selectAll} className="text-xs font-bold text-primary hover:underline">Select All</button>
        </div>
        
        <div className="space-y-2">
          {groupedRows.map(g => {
            const hasAnySelectedInGroup = g.rows.some(r => selectedRows.includes(r.key));
            if (!hasAnySelectedInGroup && g.group !== 'basic') return null; // Only show active groups rows, default basic
            
            return g.rows.map((row) => {
              const checked = selectedRows.includes(row.key);
              
              // Find the first kana to display prominently
              const firstKana = row.entries[0]?.kana || '';
              
              return (
                <div key={row.key} className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${checked ? 'bg-surface-lowest shadow-sm' : 'bg-surface-lowest/50 opacity-60'}`}>
                  <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center font-display text-lg font-bold text-primary">
                    {firstKana}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-foreground">{row.label}</p>
                    <p className="text-[10px] text-on-surface-variant">
                      {row.entries.map(e => e.romaji).join(', ')}
                    </p>
                  </div>
                  <button 
                    onClick={() => toggleRow(row.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-outline-variant/30'}`}
                  >
                    <span className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              );
            });
          })}
        </div>
      </div>

      {/* Session Options */}
      <div>
        <h3 className="text-xs uppercase tracking-[0.2em] font-extrabold text-foreground mb-4">Session Options</h3>
        <div className="rounded-xl bg-surface-lowest p-5 shadow-sm space-y-6">
          
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold text-foreground">Batch Size</span>
              <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-bold">{batchSize} Kana</span>
            </div>
            <div className="relative pt-2 pb-6">
               <input 
                 type="range" 
                 min="1" max="4" 
                 value={batchSize} 
                 onChange={(e) => setBatchSize(Number(e.target.value) as KanaBatchSize)}
                 className="w-full h-1.5 bg-secondary-container rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-0 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-primary"
                 style={{
                   background: `linear-gradient(to right, var(--primary) ${(batchSize - 1) / 3 * 100}%, var(--secondary-container) ${(batchSize - 1) / 3 * 100}%)`
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

          <div className="pt-2 border-t border-outline-variant/10 flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-foreground">Shuffle Order</p>
              <p className="text-[10px] text-on-surface-variant mt-0.5">Randomize Kana sequence each session</p>
            </div>
            <button 
              onClick={() => setShuffleOrder(!shuffleOrder)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${shuffleOrder ? 'bg-primary' : 'bg-outline-variant/30'}`}
            >
              <span className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform ${shuffleOrder ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-4 pb-8 text-center">
         <button
            type="button"
            disabled={selectedRows.length === 0}
            onClick={startSession}
            className="w-full btn-primary-gradient flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Start Kana Session
          </button>
          <p className="text-[10px] italic text-on-surface-variant mt-3 opacity-80">
            Approx. duration: {Math.max(1, Math.round((selectedRows.length * 5) / 60))} minutes based on your selection
          </p>
      </div>
    </div>
  );
}
