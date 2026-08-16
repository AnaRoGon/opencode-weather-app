import { describe, expect, test } from "bun:test";

process.env.FORCE_COLOR = "1";

const colors = await import("../../src/utils/colors.ts");

describe("colors con FORCE_COLOR=1", () => {
  test("envuelve con códigos ANSI", () => {
    expect(colors.cyan("Hola")).toBe("\x1b[36mHola\x1b[0m");
    expect(colors.yellow("5")).toBe("\x1b[33m5\x1b[0m");
    expect(colors.green("ok")).toBe("\x1b[32mok\x1b[0m");
    expect(colors.red("error")).toBe("\x1b[31merror\x1b[0m");
    expect(colors.bold("x")).toBe("\x1b[1mx\x1b[0m");
  });
});
