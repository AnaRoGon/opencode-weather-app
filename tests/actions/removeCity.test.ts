import { beforeEach, describe, expect, mock, test, spyOn } from "bun:test";
import type { City } from "../../src/types/City.ts";
import type { Settings } from "../../src/types/Config.ts";
import type { WeatherConfig } from "../../src/types/Config.ts";

process.env.NO_COLOR = "1";

let choiceAnswer: number | null = 0;
let savedCities: City[] | undefined;
let savedSettings: Settings | undefined;

mock.module("../../src/presentation/input.ts", () => ({
  askNumberChoice: async () => choiceAnswer,
}));

mock.module("../../src/storage/citiesStorage.ts", () => ({
  saveCities: async (cities: City[]) => {
    savedCities = cities;
  },
}));

mock.module("../../src/storage/settingsStorage.ts", () => ({
  saveSettings: async (settings: Settings) => {
    savedSettings = settings;
  },
}));

const { removeCity } = await import("../../src/actions/removeCity.ts");

const madrid: City = { name: "Madrid", latitude: 40.4165, longitude: -3.70256, country: "España" };
const ottawa: City = { name: "Ottawa", latitude: 45.41117, longitude: -75.69812, country: "Canadá" };

function makeConfig(cities: City[], defaultCity: string | null): WeatherConfig {
  return { cities, defaultCity, unit: "celsius" };
}

let logSpy: ReturnType<typeof spyOn>;

beforeEach(() => {
  choiceAnswer = 0;
  savedCities = undefined;
  savedSettings = undefined;
  logSpy = spyOn(console, "log").mockImplementation(() => {});
  logSpy.mockClear();
});

function outputText(): string {
  return logSpy.mock.calls.map((args) => args[0]).join("\n");
}

describe("removeCity", () => {
  test("informa cuando no hay ciudades", async () => {
    await removeCity(makeConfig([], null));
    expect(outputText()).toContain("No hay ciudades guardadas.");
    expect(savedCities).toBeUndefined();
  });

  test("cancela con selección inválida (null)", async () => {
    choiceAnswer = null;
    await removeCity(makeConfig([madrid, ottawa], null));
    expect(outputText()).toContain("Selección inválida, cancelado.");
    expect(savedCities).toBeUndefined();
  });

  test("cancela con índice fuera de rango", async () => {
    choiceAnswer = 5;
    await removeCity(makeConfig([madrid, ottawa], null));
    expect(outputText()).toContain("Selección inválida, cancelado.");
  });

  test("elimina la ciudad elegida y la guarda", async () => {
    choiceAnswer = 1;
    const config = makeConfig([madrid, ottawa], null);
    await removeCity(config);
    expect(config.cities).toEqual([madrid]);
    expect(savedCities).toEqual([madrid]);
    expect(outputText()).toContain('Ciudad "Ottawa" eliminada.');
    expect(savedSettings).toBeUndefined();
  });

  test("resetea la ciudad default si era la eliminada", async () => {
    choiceAnswer = 0;
    const config = makeConfig([madrid, ottawa], "Madrid");
    await removeCity(config);
    expect(config.cities).toEqual([ottawa]);
    expect(config.defaultCity).toBeNull();
    expect(savedSettings?.defaultCity).toBeNull();
  });
});