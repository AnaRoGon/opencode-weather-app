import { describe, expect, test } from "bun:test";
import { CITIES_FILE, SETTINGS_FILE, SEPARATOR, WEATHER_DESCRIPTIONS } from "../../src/utils/constants.ts";

describe("constants de archivos", () => {
  test("nombres de archivos de datos", () => {
    expect(CITIES_FILE).toBe("cities.json");
    expect(SETTINGS_FILE).toBe("settings.json");
  });

  test("SEPARATOR es un string de la línea del menú", () => {
    expect(typeof SEPARATOR).toBe("string");
    expect(SEPARATOR).toContain("═");
  });
});

describe("WEATHER_DESCRIPTIONS", () => {
  test("descripciones disponibles para códigos conocidos", () => {
    expect(WEATHER_DESCRIPTIONS[0]).toBe("Cielo despejado");
    expect(WEATHER_DESCRIPTIONS[3]).toBe("Nublado");
    expect(WEATHER_DESCRIPTIONS[61]).toBe("Lluvia ligera");
    expect(WEATHER_DESCRIPTIONS[95]).toBe("Tormenta");
  });

  test("cubre los códigos principales de la API de OpenMeteo", () => {
    const expectedCodes = [0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99];
    for (const code of expectedCodes) {
      expect(typeof WEATHER_DESCRIPTIONS[code]).toBe("string");
    }
  });
});
