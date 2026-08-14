import type { Settings } from "../types/Config.ts";
import { SETTINGS_FILE } from "../utils/constants.ts";

export const DEFAULT_SETTINGS: Settings = {
  defaultCity: null,
  unit: "celsius",
};

export async function loadSettings(): Promise<Settings> {
  const file = Bun.file(SETTINGS_FILE);
  if (!(await file.exists())) {
    return { ...DEFAULT_SETTINGS };
  }

  try {
    const data = (await file.json()) as Partial<Settings>;
    return {
      defaultCity: typeof data.defaultCity === "string" ? data.defaultCity : null,
      unit: data.unit === "fahrenheit" ? "fahrenheit" : "celsius",
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await Bun.write(SETTINGS_FILE, JSON.stringify(settings, null, 2) + "\n");
}