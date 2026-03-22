"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getStoredSettings, saveStoredSettings } from "@/lib/client-persistence";
import type { AppSettings } from "@/types/settings";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`h-8 w-14 rounded-full transition ${checked ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"}`}
    >
      <span
        className={`block h-6 w-6 rounded-full bg-white transition ${checked ? "translate-x-7" : "translate-x-1"}`}
      />
    </button>
  );
}

export function SettingsForm() {
  const [settings, setSettings] = useState<AppSettings>(() => getStoredSettings());
  const [savedMessage, setSavedMessage] = useState("");

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Theme</h2>
        <select
          value={settings.theme}
          onChange={(event) => update("theme", event.target.value as AppSettings["theme"])}
          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Units</h2>
        <select
          value={settings.units}
          onChange={(event) => update("units", event.target.value as AppSettings["units"])}
          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <option value="metric">Metric</option>
          <option value="imperial">Imperial</option>
        </select>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Notifications</h2>
        {[
          ["water", "Water reminders"],
          ["mealReminder", "Meal reminders"],
          ["weeklyReport", "Weekly reports"],
        ].map(([key, label]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
            <Toggle
              checked={settings.notifications[key as keyof AppSettings["notifications"]]}
              onChange={(value) =>
                update("notifications", {
                  ...settings.notifications,
                  [key]: value,
                })
              }
            />
          </div>
        ))}
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Privacy</h2>
        <select
          value={settings.privacy}
          onChange={(event) => update("privacy", event.target.value as AppSettings["privacy"])}
          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <option value="private">Private</option>
          <option value="friends">Friends</option>
          <option value="public">Public</option>
        </select>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Connected APIs</h2>
        {[
          ["googleFit", "Google Fit"],
          ["appleHealth", "Apple Health"],
          ["usda", "USDA FoodData Central"],
        ].map(([key, label]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
            <Toggle
              checked={settings.connectedApis[key as keyof AppSettings["connectedApis"]]}
              onChange={(value) =>
                update("connectedApis", {
                  ...settings.connectedApis,
                  [key]: value,
                })
              }
            />
          </div>
        ))}
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Data export</h2>
        <select
          value={settings.dataExport}
          onChange={(event) => update("dataExport", event.target.value as AppSettings["dataExport"])}
          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <option value="json">JSON</option>
          <option value="csv">CSV</option>
        </select>
      </Card>

      <div className="md:col-span-2 flex items-center justify-between rounded-3xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/70">
        <p className="text-sm text-emerald-700 dark:text-emerald-300">{savedMessage}</p>
        <Button
          onClick={() => {
            saveStoredSettings(settings);
            setSavedMessage("Settings saved successfully.");
          }}
        >
          Save settings
        </Button>
      </div>
    </div>
  );
}
