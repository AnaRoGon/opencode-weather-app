import type { City } from "../types/City.ts";
import { CITIES_FILE } from "../utils/constants.ts";

export async function loadCities(): Promise<City[]> {
  const file = Bun.file(CITIES_FILE);
  if (!(await file.exists())) {
    return [];
  }

  try {
    const data = (await file.json()) as { cities?: unknown };
    return Array.isArray(data.cities) ? (data.cities as City[]) : [];
  } catch {
    return [];
  }
}

export async function saveCities(cities: City[]): Promise<void> {
  await Bun.write(CITIES_FILE, JSON.stringify({ cities }, null, 2) + "\n");
}