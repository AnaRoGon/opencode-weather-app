import { afterAll, describe, expect, mock, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const tempDir = mkdtempSync(join(tmpdir(), "weather-tests-settings-"));
const SETTINGS_FILE = join(tempDir, "settings.json");

mock.module("../../src/utils/constants.ts", () => ({
  SETTINGS_FILE,
}));

const { DEFAULT_SETTINGS, loadSettings, saveSettings } = await import("../../src/storage/settingsStorage.ts");

afterAll(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

describe("DEFAULT_SETTINGS", () => {
  test("valores por defecto", () => {
    expect(DEFAULT_SETTINGS).toEqual({ defaultCity: null, unit: "celsius" });
  });
});

describe("loadSettings", () => {
  test("devuelve los valores por defecto cuando el archivo no existe", async () => {
    expect(await loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  test("parsea un archivo válido", async () => {
    await saveSettings({ defaultCity: "Ottawa", unit: "fahrenheit" });
    expect(await loadSettings()).toEqual({ defaultCity: "Ottawa", unit: "fahrenheit" });
  });

  test("normaliza una unidad inválida a celsius", async () => {
    await Bun.write(SETTINGS_FILE, JSON.stringify({ defaultCity: "Ottawa", unit: "kelvin" }));
    expect(await loadSettings()).toEqual({ defaultCity: "Ottawa", unit: "celsius" });
  });

  test("devuelve los valores por defecto con JSON inválido", async () => {
    await Bun.write(SETTINGS_FILE, "{ roto");
    expect(await loadSettings()).toEqual(DEFAULT_SETTINGS);
  });
});

describe("saveSettings", () => {
  test("persiste las preferencias", async () => {
    await saveSettings({ defaultCity: "Madrid", unit: "celsius" });
    expect(await Bun.file(SETTINGS_FILE).json()).toEqual({ defaultCity: "Madrid", unit: "celsius" });
  });
});