import type { City } from "../types/City.ts";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

interface GeocodeResponse {
  results?: GeocodeResult[];
}

interface GeocodeResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

export async function geocodeCity(name: string): Promise<City[]> {
  const params = new URLSearchParams({
    name,
    count: "5",
    language: "es",
    format: "json",
  });

  const response = await fetch(`${GEOCODING_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Error al geocodificar la ciudad (HTTP ${response.status})`);
  }

  const data = (await response.json()) as GeocodeResponse;
  const results = data.results ?? [];

  return results.map((result) => ({
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    country: result.country ?? result.admin1 ?? "",
  }));
}