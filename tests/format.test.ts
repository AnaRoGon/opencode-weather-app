import { describe, expect, test } from "bun:test";
import { cityLabel, dayLabel, unitLabel } from "../src/utils/format.ts";
import type { City } from "../src/types/City.ts";

describe("cityLabel", () => {
  test("incluye el país cuando existe", () => {
    const city: City = { name: "Madrid", latitude: 40.4165, longitude: -3.70256, country: "España" };
    expect(cityLabel(city)).toBe("Madrid, España");
  });

  test("solo el nombre cuando el país es vacío", () => {
    const city: City = { name: "Madrid", latitude: 40.4165, longitude: -3.70256, country: "" };
    expect(cityLabel(city)).toBe("Madrid");
  });
});

describe("dayLabel", () => {
  test("formatea una fecha válida en español", () => {
    const label = dayLabel("2026-08-16");
    expect(label).not.toBe("2026-08-16");
    expect(label).toContain("16");
    expect(label.toLowerCase()).toContain("agosto");
  });

  test("devuelve la fecha cruda si es inválida", () => {
    expect(dayLabel("no-es-una-fecha")).toBe("no-es-una-fecha");
  });
});

describe("unitLabel", () => {
  test("celsius → °C", () => {
    expect(unitLabel("celsius")).toBe("°C");
  });

  test("fahrenheit → °F", () => {
    expect(unitLabel("fahrenheit")).toBe("°F");
  });
});