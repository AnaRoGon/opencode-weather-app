import { beforeEach, describe, expect, test } from "bun:test";
import { geocodeCity } from "../src/api/geocoding.ts";

function mockFetchResponse(status: number, body: unknown) {
  globalThis.fetch = () =>
    Promise.resolve(new Response(JSON.stringify(body), { status }));
}

beforeEach(() => {
  globalThis.fetch = () => Promise.resolve(new Response());
});

describe("geocodeCity", () => {
  test("mapea los resultados correctamente", async () => {
    mockFetchResponse(200, {
      results: [
        { name: "Ottawa", latitude: 45.41117, longitude: -75.69812, country: "Canadá" },
        { name: "London", latitude: 51.5, longitude: -0.13, admin1: "England" },
      ],
    });

    const cities = await geocodeCity("Ottawa");
    expect(cities).toEqual([
      { name: "Ottawa", latitude: 45.41117, longitude: -75.69812, country: "Canadá" },
      { name: "London", latitude: 51.5, longitude: -0.13, country: "England" },
    ]);
  });

  test("usa admin1 como país cuando no hay country", async () => {
    mockFetchResponse(200, {
      results: [{ name: "Granada", latitude: 37.18817, longitude: -3.60667, admin1: "Andalucía" }],
    });

    const cities = await geocodeCity("Granada");
    expect(cities[0]?.country).toBe("Andalucía");
  });

  test("devuelve lista vacía cuando no hay results", async () => {
    mockFetchResponse(200, {});
    expect(await geocodeCity("xyz")).toEqual([]);
  });

  test("devuelve lista vacía cuando results es undefined", async () => {
    mockFetchResponse(200, { results: undefined });
    expect(await geocodeCity("xyz")).toEqual([]);
  });

  test("lanza error en HTTP no exitoso", async () => {
    mockFetchResponse(500, {});
    expect(geocodeCity("xyz")).rejects.toThrow("Error al geocodificar la ciudad (HTTP 500)");
  });
});