import { runMenu } from "./presentation/menu.ts";
import { closeInput } from "./presentation/input.ts";
import { loadCities } from "./storage/citiesStorage.ts";
import { loadSettings } from "./storage/settingsStorage.ts";
import type { WeatherConfig } from "./types/Config.ts";

async function main(): Promise<void> {
  const [cities, settings] = await Promise.all([loadCities(), loadSettings()]);
  const config: WeatherConfig = {
    cities,
    defaultCity: settings.defaultCity,
    unit: settings.unit,
  };

  await runMenu(config);
  closeInput();
}

main();