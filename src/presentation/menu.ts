import type { WeatherConfig } from "../types/Config.ts";
import type { MenuOption } from "../types/MenuOption.ts";
import { adjustSettings } from "../actions/adjustSettings.ts";
import { addCity } from "../actions/addCity.ts";
import { getForecast } from "../actions/getForecast.ts";
import { getWeather } from "../actions/getWeather.ts";
import { getWeatherAll } from "../actions/getWeatherAll.ts";
import { listCities } from "../actions/listCities.ts";
import { removeCity } from "../actions/removeCity.ts";
import { setDefaultCity } from "../actions/setDefaultCity.ts";
import { prompt } from "./input.ts";
import { showInfo } from "./output.ts";
import { cyan } from "../utils/colors.ts";
import { SEPARATOR } from "../utils/constants.ts";
import { unitLabel } from "../utils/format.ts";

export const MENU_OPTIONS: MenuOption[] = [
  { id: "1", label: () => "Clima de ciudad default", handler: getWeather },
  { id: "2", label: (config) => `Clima de todas las ciudades (${config.cities.length})`, handler: getWeatherAll },
  { id: "3", label: () => "Buscar y agregar ciudad", handler: addCity },
  { id: "4", label: () => "Eliminar ciudad", handler: removeCity },
  { id: "5", label: () => "Establecer ciudad default", handler: setDefaultCity },
  { id: "6", label: () => "Pronóstico de 7 días", handler: getForecast },
  { id: "7", label: () => "Listar ciudades", handler: listCities },
  { id: "8", label: (config) => `Ajustes (${unitLabel(config.unit)})`, handler: adjustSettings },
  { id: "9", label: () => "Salir", handler: async () => {}, exit: true },
];

export function renderMenu(config: WeatherConfig): void {
  const lines = MENU_OPTIONS.map((option) => `  ${option.id}. ${option.label(config)}`).join("\n");
  console.log(`\n${SEPARATOR}\n${cyan("         WEATHER CLI")}\n${SEPARATOR}\n${lines}\n${SEPARATOR}`);
}

export async function runMenu(config: WeatherConfig): Promise<void> {
  let running = true;

  while (running) {
    renderMenu(config);
    const answer = await prompt("  Selecciona una opción: ");
    const option = MENU_OPTIONS.find((item) => item.id === answer);

    if (!option) {
      showInfo("Opción inválida. Intenta de nuevo.");
      continue;
    }

    await option.handler(config);
    if (option.exit) {
      running = false;
    }
  }
}