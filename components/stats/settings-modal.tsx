"use client";

import { useRef, useState } from "react";

import {
  exportAllData,
  getSettings,
  importData,
  resetAllProgress,
  saveSettings,
} from "@/lib/srs";

type SettingsModalProps = {
  onClose: () => void;
};

const goalOptions = [10, 20, 30, 50];

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState(() => getSettings());
  const [confirmReset, setConfirmReset] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleGoalChange = (goal: number) => {
    const updated = { ...settings, dailyGoal: goal };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `benkyo-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    fileRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importData(reader.result as string);
        setImportStatus("Progress imported successfully.");
      } catch {
        setImportStatus("Invalid file. Import failed.");
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetAllProgress();
    onClose();
    window.location.reload();
  };

  return (
    // Outer: fixed overlay covering the entire viewport at z-50
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Settings and data"
    >
      {/* No backdrop — click outside the panel to close */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden />

      {/* Modal panel — solid surface, no transparency */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl bg-surface-lowest shadow-[0_32px_80px_rgba(0,36,70,0.22)] border border-outline-variant/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-outline-variant/15">
          <p className="text-xs uppercase tracking-[0.22em] font-bold text-primary">
            Settings & Data
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-low transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Close settings"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Daily goal */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">
              Daily goal
            </p>
            <div className="flex gap-2">
              {goalOptions.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => handleGoalChange(goal)}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    settings.dailyGoal === goal
                      ? "bg-primary text-white shadow-sm"
                      : "bg-surface-low text-on-surface-variant hover:bg-secondary-container"
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-on-surface-variant">
              cards per day target — shown in the daily goal ring on Home
            </p>
          </div>

          {/* Export / Import */}
          <div className="border-t border-outline-variant/15 pt-5">
            <p className="text-sm font-semibold text-foreground mb-3">Data</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="rounded-lg bg-surface-low px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary transition hover:bg-secondary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Export progress
              </button>
              <button
                type="button"
                onClick={handleImport}
                className="rounded-lg bg-surface-low px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary transition hover:bg-secondary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Import progress
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".json"
                onChange={onFileChange}
                className="hidden"
              />
            </div>
            {importStatus && (
              <p className="mt-2 text-xs text-on-surface-variant">{importStatus}</p>
            )}
          </div>

          {/* Reset */}
          <div className="border-t border-outline-variant/15 pt-5">
            <p className="text-sm font-semibold text-foreground mb-3">
              Danger zone
            </p>
            <button
              type="button"
              onClick={handleReset}
              className={`rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                confirmReset
                  ? "bg-red-600 text-white hover:bg-red-500"
                  : "border border-red-300 text-red-700 hover:bg-red-50"
              }`}
            >
              {confirmReset
                ? "Confirm — all progress will be lost"
                : "Reset all progress"}
            </button>
            {confirmReset && (
              <p className="mt-2 text-xs text-red-600">
                This cannot be undone. Click again to confirm.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-primary-gradient rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
