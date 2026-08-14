import type { City } from "./City.ts";

export type TemperatureUnit = "celsius" | "fahrenheit";

export interface Settings {
  defaultCity: string | null;
  unit: TemperatureUnit;
}

export interface WeatherConfig extends Settings {
  cities: City[];
}