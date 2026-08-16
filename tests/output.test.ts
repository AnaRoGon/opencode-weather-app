import { beforeEach, describe, expect, test, spyOn } from "bun:test";
import type { City } from "../src/types/City.ts";

process.env.NO_COLOR = "1";

const output = await import("../src/presentation/output.ts");

const city: City = { name: "Madrid", latitude: 40.4165, longitude: -3.70256, country: "España" };

let logSpy: ReturnType<typeof spyOn>;
let logged: unknown[][];

beforeEach(() => {
  logSpy = spyOn(console, "log").mockImplementation((...args: unknown[]) => {
    logged.push(args);
  });
  logged = [];
  logSpy.mockClear();
});

function lastMessage(): string {
  const last = logged[logged.length - 1];
  return last === undefined ? "" : (last[0] as string);
}

describe("showInfo / showPlain / showSuccess / showError", () => {
  test("showInfo formatea con salto de línea y sangría", () => {
    output.showInfo("Hola");
    expect(lastMessage()).toBe("\n  Hola");
  });

  test("showPlain imprime tal cual", () => {
    output.showPlain("texto");
    expect(lastMessage()).toBe("texto");
  });

  test("showSuccess marca el mensaje", () => {
    output.showSuccess("Todo ok");
    expect(lastMessage()).toBe("\n  Todo ok");
  });

  test("showError marca el mensaje de error", () => {
    output.showError("Algo falló");
    expect(lastMessage()).toBe("\n  Algo falló");
  });
});

describe("showWeather", () => {
  test("muestra ciudad, temperatura y unidad", () => {
    output.showWeather(city, 23, "celsius");
    expect(lastMessage()).toContain("Madrid, España");
    expect(lastMessage()).toContain("23 °C");
  });

  test("usa °F en fahrenheit", () => {
    output.showWeather(city, 73, "fahrenheit");
    expect(lastMessage()).toContain("73 °F");
  });
});

describe("renderCities", () => {
  test("enumera las ciudades desde 1", () => {
    output.renderCities([city, { ...city, name: "Ottawa", country: "Canadá" }]);
    expect(logged.map((args) => args[0] as string)).toEqual([
      "  1. Madrid, España",
      "  2. Ottawa, Canadá",
    ]);
  });
});

describe("renderDailyForecast", () => {
  test("muestra mín/máx y descripción del tiempo", () => {
    output.renderDailyForecast(
      [
        { date: "2026-08-16", temperatureMax: 30, temperatureMin: 18, weatherCode: 0 },
        { date: "2026-08-17", temperatureMax: 28, temperatureMin: 17, weatherCode: 999 },
      ],
      "celsius",
    );
    const text = logged.map((args) => args[0]).join("\n");
    expect(text).toContain("18°C mín / 30°C máx");
    expect(text).toContain("Cielo despejado");
    expect(text).toContain("Clima desconocido");
  });

  test("usa °F en fahrenheit", () => {
    output.renderDailyForecast(
      [{ date: "2026-08-16", temperatureMax: 86, temperatureMin: 64, weatherCode: 0 }],
      "fahrenheit",
    );
    const text = logged.map((args) => args[0]).join("\n");
    expect(text).toContain("64°F mín / 86°F máx");
  });
});