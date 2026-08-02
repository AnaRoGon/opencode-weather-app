export interface City {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
}

export type TemperatureUnit = "celsius" | "fahrenheit";

export interface WeatherConfig {
  cities: City[];
  defaultCity: string | null;
  unit: TemperatureUnit;
}

export interface GeocodeResponse {
  results?: GeocodeResult[];
}

export interface GeocodeResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

export interface ForecastResponse {
  current?: {
    temperature_2m: number;
  };
}
