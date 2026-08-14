import type { City } from "../types/City.ts";
import type { TemperatureUnit } from "../types/Config.ts";
import type { WeatherConfig } from "../types/Config.ts";
import { getForecast } from "../api/weather.ts";
import { showError, showInfo, showWeather } from "../presentation/output.ts";

export async function showWeatherForCity(city: City, unit: TemperatureUnit): Promise<void> {
  try {
    const temperature = await getForecast(city, unit);
    showWeather(city, temperature, unit);
  } catch (error) {
    showError(`Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getWeather(config: WeatherConfig): Promise<void> {
  const city = config.cities.find((item) => item.name === config.defaultCity);
  if (!city) {
    showInfo("No hay ciudad default configurada. Usa la opción 5 para establecerla.");
    return;
  }
  await showWeatherForCity(city, config.unit);
}