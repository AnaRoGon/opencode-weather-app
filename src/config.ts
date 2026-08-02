import type { WeatherConfig } from "./types.ts";

const CONFIG_FILE = "weather.json";

export const DEFAULT_CONFIG: WeatherConfig = {
  cities: [],
  defaultCity: null,
  unit: "celsius",
};

export async function loadConfig(): Promise<WeatherConfig> {
  const file = Bun.file(CONFIG_FILE);
  if (!(await file.exists())) {
    return { ...DEFAULT_CONFIG };
  }

  try {
    const data = (await file.json()) as Partial<WeatherConfig>;
    return {
      cities: Array.isArray(data.cities) ? data.cities : [],
      defaultCity: typeof data.defaultCity === "string" ? data.defaultCity : null,
      unit: data.unit === "fahrenheit" ? "fahrenheit" : "celsius",
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function saveConfig(config: WeatherConfig): Promise<void> {
  await Bun.write(CONFIG_FILE, JSON.stringify(config, null, 2) + "\n");
}
