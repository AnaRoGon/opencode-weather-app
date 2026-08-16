import { beforeEach, describe, expect, mock, test, spyOn } from "bun:test";
import type { Settings } from "../../src/types/Config.ts";
import type { WeatherConfig } from "../../src/types/Config.ts";

process.env.NO_COLOR = "1";

let promptAnswer = "";
let savedSettings: Settings | undefined;

mock.module("../../src/presentation/input.ts", () => ({
  prompt: async () => promptAnswer,
}));

mock.module("../../src/storage/settingsStorage.ts", () => ({
  saveSettings: async (settings: Settings) => {
    savedSettings = settings;
  },
}));

const { adjustSettings } = await import("../../src/actions/adjustSettings.ts");

function makeConfig(unit: "celsius" | "fahrenheit" = "celsius"): WeatherConfig {
  return { cities: [], defaultCity: null, unit };
}

let logSpy: ReturnType<typeof spyOn>;

beforeEach(() => {
  promptAnswer = "";
  savedSettings = undefined;
  logSpy = spyOn(console, "log").mockImplementation(() => {});
  logSpy.mockClear();
});

function outputText(): string {
  return logSpy.mock.calls.map((args) => args[0]).join("\n");
}

describe("adjustSettings", () => {
  test("cambia a celsius y guarda", async () => {
    promptAnswer = "1";
    const config = makeConfig("fahrenheit");
    await adjustSettings(config);
    expect(config.unit).toBe("celsius");
    expect(savedSettings?.unit).toBe("celsius");
    expect(outputText()).toContain("Unidad actualizada: °C");
  });

  test("cambia a fahrenheit y guarda", async () => {
    promptAnswer = "2";
    const config = makeConfig("celsius");
    await adjustSettings(config);
    expect(config.unit).toBe("fahrenheit");
    expect(savedSettings?.unit).toBe("fahrenheit");
    expect(outputText()).toContain("Unidad actualizada: °F");
  });

  test("descarta los cambios con cualquier otra opción", async () => {
    promptAnswer = "5";
    const config = makeConfig("celsius");
    await adjustSettings(config);
    expect(config.unit).toBe("celsius");
    expect(savedSettings).toBeUndefined();
    expect(outputText()).toContain("Cambios descartados.");
  });
});