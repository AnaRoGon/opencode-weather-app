import { beforeEach, describe, expect, mock, test, spyOn } from "bun:test";
import type { City } from "../../src/types/City.ts";
import type { Settings } from "../../src/types/Config.ts";
import type { WeatherConfig } from "../../src/types/Config.ts";

process.env.NO_COLOR = "1";

let choiceAnswer: number | null = 0;
let savedSettings: Settings | undefined;

mock.module("../../src/presentation/input.ts", () => ({
  askNumberChoice: async () => choiceAnswer,
}));

mock.module("../../src/actions/addCity.ts", () => ({
  addCity: async (config: WeatherConfig) => {
    config.cities.push({ name: "Granada", latitude: 37.18817, longitude: -3.60667, country: "España" });
  },
}));

mock.module("../../src/storage/settingsStorage.ts", () => ({
  saveSettings: async (settings: Settings) => {
    savedSettings = settings;
  },
}));

const { setDefaultCity } = await import("../../src/actions/setDefaultCity.ts");

const madrid: City = { name: "Madrid", latitude: 40.4165, longitude: -3.70256, country: "España" };
const ottawa: City = { name: "Ottawa", latitude: 45.41117, longitude: -75.69812, country: "Canadá" };

function makeConfig(cities: City[] = [], defaultCity: string | null = null): WeatherConfig {
  return { cities, defaultCity, unit: "celsius" };
}

let logSpy: ReturnType<typeof spyOn>;

beforeEach(() => {
  choiceAnswer = 0;
  savedSettings = undefined;
  logSpy = spyOn(console, "log").mockImplementation(() => {});
  logSpy.mockClear();
});

function outputText(): string {
  return logSpy.mock.calls.map((args) => args[0]).join("\n");
}

describe("setDefaultCity", () => {
  test("informa cuando no hay ciudades", async () => {
    const config = makeConfig();
    await setDefaultCity(config);
    expect(outputText()).toContain("No hay ciudades guardadas.");
    expect(savedSettings).toBeUndefined();
  });

  test("cancela con selección inválida", async () => {
    choiceAnswer = null;
    const config = makeConfig([madrid, ottawa]);
    await setDefaultCity(config);
    expect(outputText()).toContain("Selección inválida, cancelado.");
    expect(savedSettings).toBeUndefined();
  });

  test("establece una ciudad existente como default", async () => {
    choiceAnswer = 1;
    const config = makeConfig([madrid, ottawa], null);
    await setDefaultCity(config);
    expect(config.defaultCity).toBe("Ottawa");
    expect(savedSettings?.defaultCity).toBe("Ottawa");
    expect(outputText()).toContain('Ciudad default establecida: "Ottawa, Canadá".');
  });

  test("busca una ciudad nueva y la establece como default", async () => {
    choiceAnswer = 2;
    const config = makeConfig([madrid, ottawa], null);
    await setDefaultCity(config);
    expect(outputText()).toContain("Buscar una nueva ciudad");
    expect(config.cities).toHaveLength(3);
    expect(config.defaultCity).toBe("Granada");
    expect(savedSettings?.defaultCity).toBe("Granada");
  });
});