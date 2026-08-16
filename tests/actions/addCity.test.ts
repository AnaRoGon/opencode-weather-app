import { beforeEach, describe, expect, mock, test, spyOn } from "bun:test";
import type { City } from "../../src/types/City.ts";
import type { WeatherConfig } from "../../src/types/Config.ts";

process.env.NO_COLOR = "1";

let nameAnswer = "";
let choiceAnswer: number | null = 0;
let geocodeResults: City[] = [];
let savedCities: City[] | undefined;

mock.module("../../src/presentation/input.ts", () => ({
  prompt: async () => nameAnswer,
  askNumberChoice: async () => choiceAnswer,
}));

mock.module("../../src/api/geocoding.ts", () => ({
  geocodeCity: async () => geocodeResults,
}));

mock.module("../../src/storage/citiesStorage.ts", () => ({
  saveCities: async (cities: City[]) => {
    savedCities = cities;
  },
}));

const { addCity } = await import("../../src/actions/addCity.ts");

const madrid: City = { name: "Madrid", latitude: 40.4165, longitude: -3.70256, country: "España" };

function makeConfig(cities: City[] = []): WeatherConfig {
  return { cities, defaultCity: null, unit: "celsius" };
}

let logSpy: ReturnType<typeof spyOn>;

beforeEach(() => {
  nameAnswer = "";
  choiceAnswer = 0;
  geocodeResults = [];
  savedCities = undefined;
  logSpy = spyOn(console, "log").mockImplementation(() => {});
  logSpy.mockClear();
});

function outputText(): string {
  return logSpy.mock.calls.map((args) => args[0]).join("\n");
}

describe("addCity", () => {
  test("cancela con nombre vacío", async () => {
    nameAnswer = "";
    const config = makeConfig();
    await addCity(config);
    expect(outputText()).toContain("Nombre vacío, cancelado.");
    expect(savedCities).toBeUndefined();
  });

  test("informa cuando no se encuentra ninguna ciudad", async () => {
    nameAnswer = "xyz";
    geocodeResults = [];
    const config = makeConfig();
    await addCity(config);
    expect(outputText()).toContain('No se encontró ninguna ciudad para "xyz".');
  });

  test("cancela con selección inválida", async () => {
    nameAnswer = "Madrid";
    geocodeResults = [madrid];
    choiceAnswer = null;
    const config = makeConfig();
    await addCity(config);
    expect(outputText()).toContain("Selección inválida, cancelado.");
    expect(config.cities).toHaveLength(0);
  });

  test("evita agregar una ciudad duplicada", async () => {
    nameAnswer = "Madrid";
    geocodeResults = [madrid];
    choiceAnswer = 0;
    const config = makeConfig([madrid]);
    await addCity(config);
    expect(outputText()).toContain('"Madrid, España" ya está en la lista.');
    expect(config.cities).toHaveLength(1);
  });

  test("agrega la ciudad y la guarda", async () => {
    nameAnswer = "Madrid";
    geocodeResults = [madrid, { name: "Ottawa", latitude: 45.41117, longitude: -75.69812, country: "Canadá" }];
    choiceAnswer = 1;
    const config = makeConfig();
    await addCity(config);
    expect(config.cities).toEqual([{ name: "Ottawa", latitude: 45.41117, longitude: -75.69812, country: "Canadá" }]);
    expect(savedCities).toEqual(config.cities);
    expect(outputText()).toContain('Ciudad "Ottawa, Canadá" agregada.');
  });
});