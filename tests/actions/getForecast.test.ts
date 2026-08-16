import { beforeEach, describe, expect, mock, test, spyOn } from "bun:test";
import type { City } from "../../src/types/City.ts";
import type { DailyForecast } from "../../src/types/Weather.ts";
import type { WeatherConfig } from "../../src/types/Config.ts";

process.env.NO_COLOR = "1";

let choiceAnswer: number | null = 0;
let forecastResults: DailyForecast[] = [];
let forecastError: Error | undefined;
let forecastArgs: { city: City; unit: string } | undefined;

mock.module("../../src/presentation/input.ts", () => ({
  askNumberChoice: async () => choiceAnswer,
}));

mock.module("../../src/api/weather.ts", () => ({
  getDailyForecast: async (city: City, unit: string) => {
    forecastArgs = { city, unit };
    if (forecastError) throw forecastError;
    return forecastResults;
  },
}));

const { getForecast } = await import("../../src/actions/getForecast.ts");

const madrid: City = { name: "Madrid", latitude: 40.4165, longitude: -3.70256, country: "España" };

function makeConfig(cities: City[] = [madrid]): WeatherConfig {
  return { cities, defaultCity: null, unit: "celsius" };
}

let logSpy: ReturnType<typeof spyOn>;

beforeEach(() => {
  choiceAnswer = 0;
  forecastResults = [];
  forecastError = undefined;
  forecastArgs = undefined;
  logSpy = spyOn(console, "log").mockImplementation(() => {});
  logSpy.mockClear();
});

function outputText(): string {
  return logSpy.mock.calls.map((args) => args[0]).join("\n");
}

describe("getForecast", () => {
  test("informa cuando no hay ciudades", async () => {
    const config = makeConfig([]);
    await getForecast(config);
    expect(outputText()).toContain("No hay ciudades guardadas.");
    expect(forecastArgs).toBeUndefined();
  });

  test("cancela con selección inválida", async () => {
    choiceAnswer = null;
    const config = makeConfig();
    await getForecast(config);
    expect(outputText()).toContain("Selección inválida, cancelado.");
  });

  test("renderiza el pronóstico de la ciudad elegida", async () => {
    forecastResults = [
      { date: "2026-08-16", temperatureMax: 30, temperatureMin: 18, weatherCode: 0 },
    ];
    choiceAnswer = 0;
    const config = makeConfig([madrid]);
    await getForecast(config);
    expect(forecastArgs).toEqual({ city: madrid, unit: "celsius" });
    expect(outputText()).toContain("Madrid, España");
    expect(outputText()).toContain("18°C mín / 30°C máx");
  });

  test("muestra el error cuando la API falla", async () => {
    forecastError = new Error("boom");
    choiceAnswer = 0;
    const config = makeConfig([madrid]);
    await getForecast(config);
    expect(outputText()).toContain("Error: boom");
  });
});