import type { City } from "../types/City.ts";
import type { TemperatureUnit } from "../types/Config.ts";
import type { DailyForecast, DailyForecastResponse, ForecastResponse } from "../types/Weather.ts";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export async function getForecast(city: City, unit: TemperatureUnit): Promise<number> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: "temperature_2m",
    timezone: "auto",
  });

  if (unit === "fahrenheit") {
    params.set("temperature_unit", "fahrenheit");
  }

  const response = await fetch(`${FORECAST_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Error al obtener el clima (HTTP ${response.status})`);
  }

  const data = (await response.json()) as ForecastResponse;
  const current = data.current;
  if (!current) {
    throw new Error("Sin datos de temperatura actual");
  }

  return current.temperature_2m;
}

export async function getDailyForecast(city: City, unit: TemperatureUnit): Promise<DailyForecast[]> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    daily: "temperature_2m_max,temperature_2m_min,weather_code",
    forecast_days: "7",
    timezone: "auto",
  });

  if (unit === "fahrenheit") {
    params.set("temperature_unit", "fahrenheit");
  }

  const response = await fetch(`${FORECAST_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Error al obtener el pronóstico (HTTP ${response.status})`);
  }

  const data = (await response.json()) as DailyForecastResponse;
  const daily = data.daily;
  if (!daily) {
    throw new Error("Sin datos de pronóstico diario");
  }

  const { time, temperature_2m_max: max, temperature_2m_min: min, weather_code: codes } = daily;
  if (time.length === 0 || max.length === 0 || min.length === 0 || codes.length === 0) {
    throw new Error("Sin datos de pronóstico diario");
  }

  return time.map((date, index) => {
    const temperatureMax = max[index];
    const temperatureMin = min[index];
    const weatherCode = codes[index];
    if (temperatureMax === undefined || temperatureMin === undefined || weatherCode === undefined) {
      throw new Error("Datos de pronóstico incompletos");
    }
    return { date, temperatureMax, temperatureMin, weatherCode };
  });
}