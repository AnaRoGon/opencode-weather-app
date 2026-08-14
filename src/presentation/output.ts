import type { City } from "../types/City.ts";
import type { TemperatureUnit } from "../types/Config.ts";
import type { DailyForecast } from "../types/Weather.ts";
import { green, red, yellow } from "../utils/colors.ts";
import { SEPARATOR, WEATHER_DESCRIPTIONS } from "../utils/constants.ts";
import { cityLabel, dayLabel, unitLabel } from "../utils/format.ts";

export function showInfo(message: string): void {
  console.log(`\n  ${message}`);
}

export function showPlain(message: string): void {
  console.log(message);
}

export function showSuccess(message: string): void {
  console.log(`\n  ${green(message)}`);
}

export function showError(message: string): void {
  console.log(`\n  ${red(message)}`);
}

export function showWeather(city: City, temperature: number, unit: TemperatureUnit): void {
  const label = cityLabel(city);
  const value = yellow(`${temperature} ${unitLabel(unit)}`);
  console.log(`\n${SEPARATOR}\n  ${label}\n  ${value}\n${SEPARATOR}`);
}

export function renderCities(cities: City[]): void {
  cities.forEach((city, index) => {
    showPlain(`  ${index + 1}. ${cityLabel(city)}`);
  });
}

export function renderDailyForecast(forecast: DailyForecast[], unit: TemperatureUnit): void {
  const label = unitLabel(unit);
  console.log(`${SEPARATOR}`);
  for (const day of forecast) {
    const description = WEATHER_DESCRIPTIONS[day.weatherCode] ?? "Clima desconocido";
    showPlain(`  ${dayLabel(day.date)}`);
    showPlain(`    ${yellow(`${day.temperatureMin}${label}`)} mín / ${yellow(`${day.temperatureMax}${label}`)} máx`);
    showPlain(`    ${description}`);
  }
  console.log(`${SEPARATOR}`);
}