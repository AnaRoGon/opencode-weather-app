# AGENTS.md

Bun-based TypeScript weather CLI app (OpenMeteo). No tests or lint scripts exist. The app works: it runs `index.ts` and builds a standalone binary via `bun build --compile`.

## Runtime: Bun, not Node

Use Bun for everything. Do not introduce `node`, `npm`, `pnpm`, `yarn`, `ts-node`, or `dotenv`.

- Run: `bun index.ts` (or `bun run index.ts`)
- Install: `bun install`
- Test: `bun test` (none exist yet; use `bun:test` when adding)
- Execute a package: `bun <pkg>`
- Bun auto-loads `.env` - do not add dotenv loader.

## App

- Entrypoint: `index.ts`; `bun.lock` is the lockfile.
- Weather flow (see README examples):

1. geocode city via `geocoding-api.open-meteo.com/v1/search`,
2. fetch forecast via `api.open-meteo.com/v1/forecast?latitude=...&longitude=...`.

- Goal: interactive Spanish-language CLI menu (README lists options: default city, saved cities, temperature-unit setting), eventually compiled to a standalone binary via `bun build --compile`.
- All user-facing UI strings are Spanish — keep new text Spanish.

## Colors

ANSI color helpers live in `src/colors.ts` (`cyan`, `yellow`, `green`, `red`, `bold`) with no third-party deps. Accents only: cyan for the menu (separators + title), yellow for the temperature value, green for success messages, red for errors. Enabled by default but disabled when `NO_COLOR` is set or `TERM=dumb`; override with `FORCE_COLOR` (`0` disables, non-`0` enables). Do not add a color library.

## TypeScript quirks (from `tsconfig.json`)

- `moduleResolution: "bundler"`, `noEmit: true`, `verbatimModuleSyntax: true` → use `import type` for type-only imports; explicit `.ts` import extensions are allowed.
- `strict` and `noUncheckedIndexedAccess` are on — guard array/record indexing.
