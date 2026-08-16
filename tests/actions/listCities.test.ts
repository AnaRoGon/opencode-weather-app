import { beforeEach, describe, expect, mock, test, spyOn } from "bun:test";
import type { City } from "../../src/types/City.ts";
import type { WeatherConfig } from "../../src/types/Config.ts";

process.env.NO_COLOR = "1";

const { listCities } = await import("../../src/actions/listCities.ts");

const madrid: City = { name: "Madrid", latitude: 40.4165, longitude: -3.70256, country: "España" };
const ottawa: City = { name: "Ottawa", latitude: 45.41117, longitude: -75.69812, country: "Canadá" };

function makeConfig(cities: City[] = []): WeatherConfig {
  return { cities, defaultCity: null, unit: "celsius" };
}

let logSpy: ReturnType<typeof spyOn>;

beforeEach(() => {
  logSpy = spyOn(console, "log").mockImplementation(() => {});
  logSpy.mockClear();
});

function outputText(): string {
  return logSpy.mock.calls.map((args) => args[0]).join("\n");
}

describe("listCities", () => {
  test("informa cuando no hay ciudades", async () => {
    await listCities(makeConfig());
    expect(outputText()).toContain("No hay ciudades guardadas.");
  });

  test("lista las ciudades enumeradas", async () => {
    await listCities(makeConfig([madrid, ottawa]));
    expect(outputText()).toContain("1. Madrid, España");
    expect(outputText()).toContain("2. Ottawa, Canadá");
  });
});