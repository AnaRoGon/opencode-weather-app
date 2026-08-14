import type { WeatherConfig } from "../types/Config.ts";
import { geocodeCity } from "../api/geocoding.ts";
import { askNumberChoice, prompt } from "../presentation/input.ts";
import { renderCities, showInfo, showSuccess } from "../presentation/output.ts";
import { saveCities } from "../storage/citiesStorage.ts";
import { cityLabel } from "../utils/format.ts";

export async function addCity(config: WeatherConfig): Promise<void> {
  const name = await prompt("  Nombre de la ciudad: ");
  if (!name) {
    showInfo("Nombre vacío, cancelado.");
    return;
  }

  const results = await geocodeCity(name);
  if (results.length === 0) {
    showInfo(`No se encontró ninguna ciudad para "${name}".`);
    return;
  }

  renderCities(results);
  const index = await askNumberChoice("  Elige un número (0 para cancelar): ");
  const selected = index === null ? undefined : results[index];
  if (!selected) {
    showInfo("Selección inválida, cancelado.");
    return;
  }

  const exists = config.cities.some(
    (city) =>
      city.name === selected.name &&
      city.latitude === selected.latitude &&
      city.longitude === selected.longitude,
  );
  if (exists) {
    showInfo(`"${cityLabel(selected)}" ya está en la lista.`);
    return;
  }

  config.cities.push(selected);
  await saveCities(config.cities);
  showSuccess(`Ciudad "${cityLabel(selected)}" agregada.`);
}