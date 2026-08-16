import { describe, expect, test } from "bun:test";

process.env.NO_COLOR = "1";

const colors = await import("../../src/utils/colors.ts");

describe("colors con NO_COLOR=1", () => {
  test("devuelve el texto plano sin ANSI", () => {
    expect(colors.cyan("Hola")).toBe("Hola");
    expect(colors.yellow("5")).toBe("5");
    expect(colors.green("ok")).toBe("ok");
    expect(colors.red("error")).toBe("error");
    expect(colors.bold("x")).toBe("x");
  });
});
