import { stdin as input, stdout as output } from "node:process";

import type { City, TemperatureUnit } from "./types.ts";

export const SEPARATOR = "════════════════════════════════════════";

let buffer = "";
let ended = false;
let listening = false;
const pending: Array<(line: string) => void> = [];

function tryResolve(): void {
  while (pending.length > 0) {
    const newline = buffer.indexOf("\n");
    if (newline === -1) break;
    const line = buffer.slice(0, newline).replace(/\r$/, "");
    buffer = buffer.slice(newline + 1);
    const resolve = pending.shift();
    if (resolve) resolve(line);
  }
  if (ended && pending.length > 0) {
    while (pending.length > 0) {
      const resolve = pending.shift();
      if (resolve) resolve(buffer);
      buffer = "";
    }
  }
}

function ensureListening(): void {
  if (listening) return;
  listening = true;
  input.setEncoding("utf8");
  input.on("data", (chunk: string) => {
    buffer += chunk;
    tryResolve();
  });
  input.on("end", () => {
    ended = true;
    tryResolve();
  });
}

export function prompt(message: string): Promise<string> {
  output.write(message);
  return new Promise((resolve) => {
    pending.push((line) => resolve(line.trim()));
    ensureListening();
    tryResolve();
  });
}

export function closeInput(): void {
  input.removeAllListeners("data");
  input.removeAllListeners("end");
  input.pause();
}

export function renderMenu(cityCount: number, unit: TemperatureUnit): void {
  const unitLabel = unit === "celsius" ? "°C" : "°F";
  console.log(`
${SEPARATOR}
         WEATHER CLI
${SEPARATOR}
  1. Clima de ciudad default
  2. Clima de todas las ciudades (${cityCount})
  3. Buscar y agregar ciudad
  4. Eliminar ciudad
  5. Establecer ciudad default
  8. Ajustes (${unitLabel})
  9. Salir
${SEPARATOR}`);
}

export function renderCities(cities: City[]): void {
  cities.forEach((city, index) => {
    const label = city.country ? `${city.name}, ${city.country}` : city.name;
    console.log(`  ${index + 1}. ${label}`);
  });
}

export function cityLabel(city: City): string {
  return city.country ? `${city.name}, ${city.country}` : city.name;
}
