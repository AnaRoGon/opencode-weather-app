import { stdin as input, stdout as output } from "node:process";

import { cyan, yellow } from "./colors.ts";
import type { City, DailyForecast, TemperatureUnit } from "./types.ts";

const WEATHER_DESCRIPTIONS: Record<number, string> = {
  0: "Cielo despejado",
  1: "Mayormente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla con escarcha",
  51: "Llovizna ligera",
  53: "Llovizna moderada",
  55: "Llovizna intensa",
  56: "Llovizna helada ligera",
  57: "Llovizna helada intensa",
  61: "Lluvia ligera",
  63: "Lluvia moderada",
  65: "Lluvia intensa",
  66: "Lluvia helada ligera",
  67: "Lluvia helada intensa",
  71: "Nieve ligera",
  73: "Nieve moderada",
  75: "Nieve intensa",
  77: "Granos de nieve",
  80: "Chubascos ligeros",
  81: "Chubascos moderados",
  82: "Chubascos violentos",
  85: "Chubascos de nieve ligeros",
  86: "Chubascos de nieve intensos",
  95: "Tormenta",
  96: "Tormenta con granizo ligero",
  99: "Tormenta con granizo intenso",
};

export const SEPARATOR = cyan("════════════════════════════════════════");

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
${cyan("         WEATHER CLI")}
${SEPARATOR}
  1. Clima de ciudad default
  2. Clima de todas las ciudades (${cityCount})
  3. Buscar y agregar ciudad
  4. Eliminar ciudad
  5. Establecer ciudad default
  6. Pronóstico de 7 días
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

function dayLabel(date: string): string {
  const day = new Date(`${date}T12:00:00`);
  if (Number.isNaN(day.getTime())) return date;
  return new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long" }).format(day);
}

export function renderDailyForecast(forecast: DailyForecast[], unit: TemperatureUnit): void {
  const unitLabel = unit === "celsius" ? "°C" : "°F";
  console.log(`${SEPARATOR}`);
  for (const day of forecast) {
    const description = WEATHER_DESCRIPTIONS[day.weatherCode] ?? "Clima desconocido";
    console.log(`  ${dayLabel(day.date)}`);
    console.log(`    ${yellow(`${day.temperatureMin}${unitLabel}`)} mín / ${yellow(`${day.temperatureMax}${unitLabel}`)} máx`);
    console.log(`    ${description}`);
  }
  console.log(`${SEPARATOR}`);
}
