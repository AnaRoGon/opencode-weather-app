import type { WeatherConfig } from "../types/Config.ts";
import { askNumberChoice } from "../presentation/input.ts";
import { renderCities, showInfo, showSuccess } from "../presentation/output.ts";
import { saveCities } from "../storage/citiesStorage.ts";
import { saveSettings } from "../storage/settingsStorage.ts";

export async function removeCity(config: WeatherConfig): Promise<void> {
  if (config.cities.length === 0) {
    showInfo("No hay ciudades guardadas.");
    return;
  }

  renderCities(config.cities);
  const index = await askNumberChoice("  Elige un número (0 para cancelar): ");
  if (index === null) {
    showInfo("Selección inválida, cancelado.");
    return;
  }
  const city = config.cities[index];
  if (!city) {
    showInfo("Selección inválida, cancelado.");
    return;
  }

  config.cities.splice(index, 1);
  await saveCities(config.cities);

  if (config.defaultCity === city.name) {
    config.defaultCity = null;
    await saveSettings(config);
  }

  showSuccess(`Ciudad "${city.name}" eliminada.`);
}