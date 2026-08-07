function colorEnabled(): boolean {
  if (process.env.NO_COLOR !== undefined) return false;
  if (process.env.FORCE_COLOR !== undefined) return process.env.FORCE_COLOR !== "0";
  if (process.env.TERM === "dumb") return false;
  return true;
}

const enabled = colorEnabled();

const RESET = "\x1b[0m";

function wrap(code: number, text: string): string {
  if (!enabled) return text;
  return `\x1b[${code}m${text}${RESET}`;
}

export function cyan(text: string): string {
  return wrap(36, text);
}

export function yellow(text: string): string {
  return wrap(33, text);
}

export function green(text: string): string {
  return wrap(32, text);
}

export function red(text: string): string {
  return wrap(31, text);
}

export function bold(text: string): string {
  if (!enabled) return text;
  return `\x1b[1m${text}${RESET}`;
}