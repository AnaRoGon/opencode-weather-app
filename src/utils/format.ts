import type { City } from "../types/City.ts";
import type { TemperatureUnit } from "../types/Config.ts";

export function cityLabel(city: City): string {
  return city.country ? `${city.name}, ${city.country}` : city.name;
}

export function dayLabel(date: string): string {
  const day = new Date(`${date}T12:00:00`);
  if (Number.isNaN(day.getTime())) return date;
  return new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long" }).format(day);
}

export function unitLabel(unit: TemperatureUnit): string {
  return unit === "celsius" ? "°C" : "°F";
}
