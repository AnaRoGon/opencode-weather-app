import type { WeatherConfig } from "../types/Config.ts";
import { addCity } from "./addCity.ts";
import { askNumberChoice } from "../presentation/input.ts";
import { renderCities, showInfo, showPlain, showSuccess } from "../presentation/output.ts";
import { saveSettings } from "../storage/settingsStorage.ts";
import { cityLabel } from "../utils/format.ts";

export async function setDefaultCity(config: WeatherConfig): Promise<void> {
  if (config.cities.length === 0) {
    showInfo("No hay ciudades guardadas. Agrega una primero (opción 3).");
    return;
  }

  renderCities(config.cities);
  showPlain(`  ${config.cities.length + 1}. Buscar una nueva ciudad`);
  const index = await askNumberChoice("  Elige un número (0 para cancelar): ");

  if (index === config.cities.length) {
    await addCity(config);
    const added = config.cities[config.cities.length - 1];
    if (added) {
      config.defaultCity = added.name;
      await saveSettings(config);
    }
    return;
  }

  const city = index === null ? undefined : config.cities[index];
  if (!city) {
    showInfo("Selección inválida, cancelado.");
    return;
  }

  config.defaultCity = city.name;
  await saveSettings(config);
  showSuccess(`Ciudad default establecida: "${cityLabel(city)}".`);
}