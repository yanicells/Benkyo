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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/30" />
      <div
        className="glass relative z-10 w-full max-w-md rounded-lg p-6 shadow-[0_12px_32px_rgba(0,36,70,0.06)]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs uppercase tracking-[0.22em] text-primary">
          Settings & Data
        </p>

        {/* Daily goal */}
        <div className="mt-4">
          <p className="text-sm font-medium text-foreground">Daily goal</p>
          <div className="mt-2 flex gap-2">
            {goalOptions.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => handleGoalChange(goal)}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${
                  settings.dailyGoal === goal
                    ? "bg-surface-low font-semibold text-primary"
                    : "bg-surface-lowest text-on-surface-variant hover:bg-surface-low"
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        {/* Export / Import */}
        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium text-foreground">Data</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="rounded-lg bg-surface-low px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary transition hover:bg-secondary-container"
            >
              Export progress
            </button>
            <button
              type="button"
              onClick={handleImport}
              className="rounded-lg bg-surface-low px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary transition hover:bg-secondary-container"
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
            <p className="text-xs text-on-surface-variant">{importStatus}</p>
          )}
        </div>

        {/* Reset */}
        <div className="mt-6">
          <button
            type="button"
            onClick={handleReset}
            className={`rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
              confirmReset
                ? "bg-red-600 text-white hover:bg-red-500"
                : "border border-red-300 text-red-700 hover:bg-red-50"
            }`}
          >
            {confirmReset ? "Confirm reset — all progress will be lost" : "Reset all progress"}
          </button>
        </div>

        {/* Close */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-primary-gradient rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
