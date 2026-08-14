import type { WeatherConfig } from "../types/Config.ts";
import { renderCities, showInfo } from "../presentation/output.ts";

export async function listCities(config: WeatherConfig): Promise<void> {
  if (config.cities.length === 0) {
    showInfo("No hay ciudades guardadas. Usa la opción 3 para agregar una.");
    return;
  }
  renderCities(config.cities);
}