# AGENTS.md

Bun-based TypeScript weather CLI app (OpenMeteo). Tests live in `tests/` (bun:test) and run with `bun run test`. The `build` script runs the tests first and only compiles the standalone binary if they pass. No lint scripts exist.

## Runtime: Bun, not Node

Use Bun for everything. Do not introduce `node`, `npm`, `pnpm`, `yarn`, `ts-node`, or `dotenv`.

- Run: `bun src/index.ts` (or `bun run src/index.ts`)
- Install: `bun install`
- Test: `bun run test` (runs `bun test --parallel`; tests live in `tests/`). Also `bun run test:watch`, `bun run test:coverage`.
- Build: `bun run build` runs the tests first (`bun test --parallel`) and only compiles the binary if they pass.
- Execute a package: `bun <pkg>`
- Bun auto-loads `.env` - do not add dotenv loader.

## App

- Entrypoint: `src/index.ts`; `bun.lock` is the lockfile.
- Local data: `cities.json` (ciudades guardadas) y `settings.json` (defaultCity + unit), gestionados por `src/storage/`.
- Weather flow (see README examples):

1. geocode city via `geocoding-api.open-meteo.com/v1/search`,
2. fetch forecast via `api.open-meteo.com/v1/forecast?latitude=...&longitude=...`.

- Goal: interactive Spanish-language CLI menu (README lists options: default city, saved cities, temperature-unit setting), eventually compiled to a standalone binary via `bun build --compile`.
- All user-facing UI strings are Spanish — keep new text Spanish.

## Colors

ANSI color helpers live in `src/utils/colors.ts` (`cyan`, `yellow`, `green`, `red`, `bold`) with no third-party deps. Accents only: cyan for the menu (separators + title), yellow for the temperature value, green for success messages, red for errors. Enabled by default but disabled when `NO_COLOR` is set or `TERM=dumb`; override with `FORCE_COLOR` (`0` disables, non-`0` enables). Do not add a color library.

## TypeScript quirks (from `tsconfig.json`)

- `moduleResolution: "bundler"`, `noEmit: true`, `verbatimModuleSyntax: true` → use `import type` for type-only imports; explicit `.ts` import extensions are allowed.
- `strict` and `noUncheckedIndexedAccess` are on — guard array/record indexing.
