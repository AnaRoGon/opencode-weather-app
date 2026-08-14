import { stdin as input, stdout as output } from "node:process";

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

export async function askNumberChoice(message: string): Promise<number | null> {
  const answer = await prompt(message);
  if (answer === "") return null;
  const parsed = Number.parseInt(answer, 10);
  if (Number.isNaN(parsed)) return null;
  return parsed - 1;
}