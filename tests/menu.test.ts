import { beforeEach, describe, expect, mock, test, spyOn } from "bun:test";
import type { WeatherConfig } from "../src/types/Config.ts";

process.env.NO_COLOR = "1";

let promptAnswers: string[] = [];

mock.module("../src/presentation/input.ts", () => ({
  prompt: async () => promptAnswers.shift() ?? "9",
  askNumberChoice: async () => null,
  closeInput: () => {},
}));

const { runMenu } = await import("../src/presentation/menu.ts");

const config: WeatherConfig = {
  cities: [],
  defaultCity: null,
  unit: "celsius",
};

let logs: unknown[][];

beforeEach(() => {
  logs = [];
  spyOn(console, "log").mockImplementation((...args: unknown[]) => {
    logs.push(args);
  });
});

function outputText(): string {
  return logs.map((args) => args[0]).join("\n");
}

describe("runMenu", () => {
  test("salida inmediata con la opción 9", async () => {
    promptAnswers = ["9"];
    await runMenu(config);
    expect(outputText()).toContain("WEATHER CLI");
    expect(outputText()).toContain("9. Salir");
  });

  test("muestra el mensaje de opción inválida y sigue", async () => {
    promptAnswers = ["x", "9"];
    await runMenu(config);
    expect(outputText()).toContain("Opción inválida. Intenta de nuevo.");
  });

  test("opción 2 sin ciudades no accede a la red", async () => {
    promptAnswers = ["2", "9"];
    await runMenu(config);
    expect(outputText()).toContain("No hay ciudades guardadas. Usa la opción 3 para agregar una.");
  });
});