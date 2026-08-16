import { beforeEach, describe, expect, test } from "bun:test";
import { getDailyForecast, getForecast } from "../../src/api/weather.ts";
import type { City } from "../../src/types/City.ts";

const city: City = { name: "Madrid", latitude: 40.4165, longitude: -3.70256, country: "España" };

let lastUrl: string | undefined;

function mockFetchResponse(status: number, body: unknown) {
  globalThis.fetch = (input: RequestInfo | URL) => {
    lastUrl = String(input);
    return Promise.resolve(new Response(JSON.stringify(body), { status }));
  };
}

beforeEach(() => {
  lastUrl = undefined;
  globalThis.fetch = () => Promise.resolve(new Response());
});

describe("getForecast", () => {
  test("devuelve la temperatura actual", async () => {
    mockFetchResponse(200, { current: { temperature_2m: 23.4 } });
    expect(await getForecast(city, "celsius")).toBe(23.4);
  });

  test("añade temperature_unit cuando la unidad es fahrenheit", async () => {
    mockFetchResponse(200, { current: { temperature_2m: 70 } });
    await getForecast(city, "fahrenheit");
    expect(lastUrl).toContain("temperature_unit=fahrenheit");
  });

  test("no añade temperature_unit en celsius", async () => {
    mockFetchResponse(200, { current: { temperature_2m: 23 } });
    await getForecast(city, "celsius");
    expect(lastUrl ?? "").not.toContain("temperature_unit");
  });

  test("lanza error en HTTP no exitoso", async () => {
    mockFetchResponse(500, {});
    expect(getForecast(city, "celsius")).rejects.toThrow("Error al obtener el clima (HTTP 500)");
  });

  test("lanza error sin datos de temperatura actual", async () => {
    mockFetchResponse(200, {});
    expect(getForecast(city, "celsius")).rejects.toThrow("Sin datos de temperatura actual");
  });
});

describe("getDailyForecast", () => {
  test("mapea los datos diarios correctamente", async () => {
    mockFetchResponse(200, {
      daily: {
        time: ["2026-08-16", "2026-08-17"],
        temperature_2m_max: [30, 28],
        temperature_2m_min: [18, 17],
        weather_code: [0, 61],
      },
    });

    const forecast = await getDailyForecast(city, "celsius");
    expect(forecast).toEqual([
      { date: "2026-08-16", temperatureMax: 30, temperatureMin: 18, weatherCode: 0 },
      { date: "2026-08-17", temperatureMax: 28, temperatureMin: 17, weatherCode: 61 },
    ]);
  });

  test("añade temperature_unit en fahrenheit", async () => {
    mockFetchResponse(200, {
      daily: {
        time: ["2026-08-16"],
        temperature_2m_max: [90],
        temperature_2m_min: [70],
        weather_code: [0],
      },
    });
    await getDailyForecast(city, "fahrenheit");
    expect(lastUrl).toContain("temperature_unit=fahrenheit");
  });

  test("lanza error en HTTP no exitoso", async () => {
    mockFetchResponse(500, {});
    expect(getDailyForecast(city, "celsius")).rejects.toThrow("Error al obtener el pronóstico (HTTP 500)");
  });

  test("lanza error sin datos de pronóstico diario", async () => {
    mockFetchResponse(200, {});
    expect(getDailyForecast(city, "celsius")).rejects.toThrow("Sin datos de pronóstico diario");
  });

  test("lanza error cuando hay arrays vacíos", async () => {
    mockFetchResponse(200, {
      daily: { time: [], temperature_2m_max: [], temperature_2m_min: [], weather_code: [] },
    });
    expect(getDailyForecast(city, "celsius")).rejects.toThrow("Sin datos de pronóstico diario");
  });

  test("lanza error cuando un índice está incompleto", async () => {
    mockFetchResponse(200, {
      daily: {
        time: ["2026-08-16", "2026-08-17"],
        temperature_2m_max: [30],
        temperature_2m_min: [18],
        weather_code: [0],
      },
    });
    expect(getDailyForecast(city, "celsius")).rejects.toThrow("Datos de pronóstico incompletos");
  });
});
