import { afterAll, beforeAll, describe, expect, mock, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { City } from "../../src/types/City.ts";

const tempDir = mkdtempSync(join(tmpdir(), "weather-tests-cities-"));
const CITIES_FILE = join(tempDir, "cities.json");

mock.module("../../src/utils/constants.ts", () => ({
  CITIES_FILE,
}));

const { loadCities, saveCities } = await import("../../src/storage/citiesStorage.ts");

afterAll(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

const sampleCity: City = { name: "Madrid", latitude: 40.4165, longitude: -3.70256, country: "España" };

describe("loadCities", () => {
  test("devuelve [] cuando el archivo no existe", async () => {
    expect(await loadCities()).toEqual([]);
  });

  test("devuelve las ciudades guardadas", async () => {
    await saveCities([sampleCity]);
    expect(await loadCities()).toEqual([sampleCity]);
  });

  test("devuelve [] cuando el JSON es inválido", async () => {
    await Bun.write(CITIES_FILE, "{ no es json");
    expect(await loadCities()).toEqual([]);
  });

  test("devuelve [] cuando falta la clave cities", async () => {
    await Bun.write(CITIES_FILE, JSON.stringify({ other: 1 }));
    expect(await loadCities()).toEqual([]);
  });
});

describe("saveCities", () => {
  test("persiste el JSON con la clave cities", async () => {
    await saveCities([sampleCity]);
    const data = await Bun.file(CITIES_FILE).json();
    expect(data.cities).toEqual([sampleCity]);
  });
});