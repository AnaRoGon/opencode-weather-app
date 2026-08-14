import type { WeatherConfig } from "../types/Config.ts";
import { showInfo } from "../presentation/output.ts";
import { showWeatherForCity } from "./getWeather.ts";

export async function getWeatherAll(config: WeatherConfig): Promise<void> {
  if (config.cities.length === 0) {
    showInfo("No hay ciudades guardadas. Usa la opción 3 para agregar una.");
    return;
  }
  for (const city of config.cities) {
    await showWeatherForCity(city, config.unit);
  }
}