import { beforeEach, describe, expect, mock, test, spyOn } from "bun:test";
import type { City } from "../../src/types/City.ts";
import type { TemperatureUnit } from "../../src/types/Config.ts";
import type { WeatherConfig } from "../../src/types/Config.ts";

process.env.NO_COLOR = "1";

let currentTemp = 0;
let tempError: Error | undefined;
let weatherArgs: { city: City; unit: TemperatureUnit } | undefined;

mock.module("../../src/api/weather.ts", () => ({
  getForecast: async (city: City, unit: TemperatureUnit) => {
    weatherArgs = { city, unit };
    if (tempError) throw tempError;
    return currentTemp;
  },
}));

const { getWeather, showWeatherForCity } = await import("../../src/actions/getWeather.ts");

const madrid: City = { name: "Madrid", latitude: 40.4165, longitude: -3.70256, country: "España" };
const ottawa: City = { name: "Ottawa", latitude: 45.41117, longitude: -75.69812, country: "Canadá" };

function makeConfig(cities: City[], defaultCity: string | null): WeatherConfig {
  return { cities, defaultCity, unit: "celsius" };
}

let logSpy: ReturnType<typeof spyOn>;

beforeEach(() => {
  currentTemp = 0;
  tempError = undefined;
  weatherArgs = undefined;
  logSpy = spyOn(console, "log").mockImplementation(() => {});
  logSpy.mockClear();
});

function outputText(): string {
  return logSpy.mock.calls.map((args) => args[0]).join("\n");
}

describe("getWeather", () => {
  test("informa cuando no hay ciudad default", async () => {
    const config = makeConfig([madrid], null);
    await getWeather(config);
    expect(outputText()).toContain("No hay ciudad default configurada.");
    expect(weatherArgs).toBeUndefined();
  });

  test("muestra el clima de la ciudad default", async () => {
    currentTemp = 23.4;
    const config = makeConfig([madrid], "Madrid");
    await getWeather(config);
    expect(weatherArgs).toEqual({ city: madrid, unit: "celsius" });
    expect(outputText()).toContain("Madrid, España");
    expect(outputText()).toContain("23.4 °C");
  });

  test("muestra el error de la API en el clima default", async () => {
    tempError = new Error("apagón");
    const config = makeConfig([madrid], "Madrid");
    await getWeather(config);
    expect(outputText()).toContain("Error: apagón");
  });
});

describe("showWeatherForCity", () => {
  test("muestra el clima de una ciudad", async () => {
    currentTemp = 20;
    await showWeatherForCity(ottawa, "celsius");
    expect(outputText()).toContain("Ottawa, Canadá");
    expect(outputText()).toContain("20 °C");
  });

  test("captura los errores de la API", async () => {
    tempError = new Error("down");
    await showWeatherForCity(ottawa, "celsius");
    expect(outputText()).toContain("Error: down");
  });
});