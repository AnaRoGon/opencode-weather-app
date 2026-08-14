import type { WeatherConfig } from "../types/Config.ts";
import { getDailyForecast } from "../api/weather.ts";
import { askNumberChoice } from "../presentation/input.ts";
import { renderCities, renderDailyForecast, showError, showInfo } from "../presentation/output.ts";
import { cityLabel } from "../utils/format.ts";

export async function getForecast(config: WeatherConfig): Promise<void> {
  if (config.cities.length === 0) {
    showInfo("No hay ciudades guardadas. Usa la opción 3 para agregar una.");
    return;
  }

  renderCities(config.cities);
  const index = await askNumberChoice("  Elige un número (0 para cancelar): ");
  const city = index === null ? undefined : config.cities[index];
  if (!city) {
    showInfo("Selección inválida, cancelado.");
    return;
  }

  try {
    const forecast = await getDailyForecast(city, config.unit);
    showInfo(cityLabel(city));
    renderDailyForecast(forecast, config.unit);
  } catch (error) {
    showError(`Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}