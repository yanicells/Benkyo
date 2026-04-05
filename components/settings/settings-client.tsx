"use client";

import { useState, useEffect } from "react";
import { PageShell } from "@/components/shared/page-shell";
import { getSettings, saveSettings } from "@/lib/srs";

export function SettingsClient() {
  const [dailyGoal, setDailyGoal] = useState(20);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = getSettings();
    setDailyGoal(s.dailyGoal);
  }, []);

  const handleSave = () => {
    saveSettings({ dailyGoal });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <PageShell eyebrow="Settings" title="Preferences">
      <div className="space-y-6">
        {/* Daily Goal */}
        <div className="rounded-2xl bg-surface-lowest shadow-[0_12px_40px_rgba(0,14,33,0.06)] p-6">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-1">
              Daily Goal
            </p>
            <p className="text-sm text-on-surface-variant">
              How many cards do you want to review per day?
            </p>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="flex-1 accent-primary h-2"
            />
            <span className="font-display text-2xl font-bold text-primary w-14 text-right">
              {dailyGoal}
            </span>
          </div>
          <div className="flex justify-between text-[10px] text-on-surface-variant mt-1 px-1">
            <span>5</span>
            <span>100</span>
          </div>
        </div>

        {/* Data Management */}
        <div className="rounded-2xl bg-surface-lowest shadow-[0_12px_40px_rgba(0,14,33,0.06)] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-4">
            Data
          </p>
          <p className="text-sm text-on-surface-variant mb-4">
            Your study data is stored locally in your browser. Sign in from your profile to sync across devices.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const data = {
                  srs: localStorage.getItem("benkyou-srs-data"),
                  daily: localStorage.getItem("benkyou-daily-stats"),
                  settings: localStorage.getItem("benkyou-settings"),
                  streak: localStorage.getItem("benkyou-streak"),
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `benkyo-backup-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="rounded-xl bg-surface-low px-4 py-2.5 text-sm font-semibold text-primary hover:bg-secondary-container transition-colors"
            >
              Export Data
            </button>
          </div>
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          className="w-full btn-primary-gradient rounded-xl py-3.5 text-white font-bold text-sm shadow-[0_8px_24px_rgba(0,36,70,0.12)] transition hover:opacity-90"
        >
          {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </PageShell>
  );
}
