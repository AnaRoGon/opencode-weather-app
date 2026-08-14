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

export interface DailyForecast {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  weatherCode: number;
}

export interface DailyForecastResponse {
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
  };
}
