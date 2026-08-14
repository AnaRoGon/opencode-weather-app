import type { WeatherConfig } from "./Config.ts";

export interface MenuOption {
  id: string;
  label: (config: WeatherConfig) => string;
  handler: (config: WeatherConfig) => Promise<void>;
  exit?: boolean;
}