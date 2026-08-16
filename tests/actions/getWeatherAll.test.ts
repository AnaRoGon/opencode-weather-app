import { beforeEach, describe, expect, mock, test, spyOn } from "bun:test";
import type { City } from "../../src/types/City.ts";
import type { TemperatureUnit } from "../../src/types/Config.ts";
import type { WeatherConfig } from "../../src/types/Config.ts";

process.env.NO_COLOR = "1";

let calls: Array<{ city: City; unit: TemperatureUnit }> = [];

mock.module("../../src/actions/getWeather.ts", () => ({
  showWeatherForCity: async (city: City, unit: TemperatureUnit) => {
    calls.push({ city, unit });
  },
}));

const { getWeatherAll } = await import("../../src/actions/getWeatherAll.ts");

const madrid: City = { name: "Madrid", latitude: 40.4165, longitude: -3.70256, country: "España" };
const ottawa: City = { name: "Ottawa", latitude: 45.41117, longitude: -75.69812, country: "Canadá" };

function makeConfig(cities: City[] = []): WeatherConfig {
  return { cities, defaultCity: null, unit: "celsius" };
}

let logSpy: ReturnType<typeof spyOn>;

beforeEach(() => {
  calls = [];
  logSpy = spyOn(console, "log").mockImplementation(() => {});
  logSpy.mockClear();
});

function outputText(): string {
  return logSpy.mock.calls.map((args) => args[0]).join("\n");
}

describe("getWeatherAll", () => {
  test("informa cuando no hay ciudades", async () => {
    const config = makeConfig();
    await getWeatherAll(config);
    expect(outputText()).toContain("No hay ciudades guardadas.");
    expect(calls).toHaveLength(0);
  });

  test("consulta el clima de todas las ciudades", async () => {
    const config = makeConfig([madrid, ottawa]);
    await getWeatherAll(config);
    expect(calls).toEqual([
      { city: madrid, unit: "celsius" },
      { city: ottawa, unit: "celsius" },
    ]);
  });
});