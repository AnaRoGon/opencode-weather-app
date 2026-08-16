import { describe, expect, test } from "bun:test";
import { stdin } from "node:process";
import { askNumberChoice, prompt } from "../../src/presentation/input.ts";

function feedInput(data: string): void {
  stdin.emit("data", data);
}

describe("prompt", () => {
  test("resuelve la línea recortada", async () => {
    const result = prompt("  > ");
    feedInput("   Valencia  \n");
    expect(await result).toBe("Valencia");
  });

  test("resuelve varias peticiones en orden", async () => {
    const first = prompt("  1: ");
    const second = prompt("  2: ");
    feedInput("uno\n");
    feedInput("dos\n");
    expect(await first).toBe("uno");
    expect(await second).toBe("dos");
  });
});

describe("askNumberChoice", () => {
  test("devuelve el índice 0-based", async () => {
    const result = askNumberChoice("  Elige: ");
    feedInput("3\n");
    expect(await result).toBe(2);
  });

  test("devuelve null con entrada vacía", async () => {
    const result = askNumberChoice("  Elige: ");
    feedInput("\n");
    expect(await result).toBeNull();
  });

  test("devuelve null con entrada no numérica", async () => {
    const result = askNumberChoice("  Elige: ");
    feedInput("abc\n");
    expect(await result).toBeNull();
  });

  test("devuelve -1 para 0 (comportamiento actual)", async () => {
    const result = askNumberChoice("  Elige: ");
    feedInput("0\n");
    expect(await result).toBe(-1);
  });
});
