# AGENTS.md

Guidance for AI coding agents (and humans) working in this repository.

## Project

**Therra Space** — building the **Therra Intelligence Platform (TIP)**, a B2B geospatial intelligence MVP. Tagline: *"Measure the pulse of civilization."*

TIP turns public thermal / Earth-observation data into risk intelligence for insurers, infrastructure operators, governments, and energy companies. The core concept is the **Thermal Heartbeat**: every monitored asset (refinery, LNG terminal, data center, desalination plant, power corridor, urban district, …) has a temperature time-series, and deviations from its baseline drive anomaly, risk, and insurance scores. This is a **Phase 0 investor-demo MVP** — it uses mock/seeded data and labels it as such; the pitch narrative leads toward a future dedicated thermal-satellite constellation.

The full product brief lives in [`docs/EARLY_PROPOSAL.md`](docs/EARLY_PROPOSAL.md) and the build plan in [`docs/TODO.md`](docs/TODO.md).

> **Scope note:** this is a **frontend-only demo** — no backend, no login, no database. The goal is for investors and audiences to *envision* the product on their **phones and laptops**, so it must be fully responsive and visually polished. The proposal was written as a generic "build from scratch" prompt (React+Tailwind+FastAPI+PostgreSQL+Docker); we **adapt it to this repo**: one TanStack Start codebase, plain CSS design tokens (no Tailwind), and all data served from **static client-side mock modules** (no server functions, no auth). Treat the proposal's backend/auth/stack sections as inspiration, not requirements.

## Stack

| Concern         | Choice                                                  |
| --------------- | ------------------------------------------------------- |
| Language        | TypeScript (strict)                                     |
| Framework       | TanStack Start (full-stack React 19, file-based routing) |
| Router          | TanStack Router                                         |
| Build / dev     | Vite 8                                                  |
| Lint / format   | **Biome** (`biome.json`) — not ESLint/Prettier          |
| Styling         | Plain CSS with a fluid design-token system (`src/styles`) |
| Map             | Mapbox GL JS (`src/components/MapView.tsx`)             |
| Charts          | Recharts (planned)                                      |
| Icons           | Lucide React (planned)                                  |
| Data            | Static client-side **mock modules** (no backend, no auth) |
| Package manager | **pnpm 11+** (do not use npm or yarn)                   |
| Runtime         | Node.js 24                                              |
| Hosting         | Netlify (official-partner Vite plugin)                  |
| Unit testing    | **Vitest** + Testing Library (jsdom)                    |
| E2E testing     | Playwright (planned)                                    |
| Environment     | Nix flake (`flake.nix`) — `devShells.default`           |

## Getting started

The development environment is pinned with Nix. Enter the shell before
running anything:

```bash
nix develop          # provides node 24, pnpm, typescript, biome
pnpm install
cp .env.example .env # then add your Mapbox token (see Environment variables)
pnpm dev             # start the dev server on http://localhost:3000
```

If you use direnv, add `use flake` to `.envrc` to load the shell
automatically.

> **pnpm version:** `packageManager` pins pnpm 11.6.0; modern pnpm
> self-manages to it. The flake's pnpm is only a bootstrap.

> **NixOS note:** Playwright's bundled Chromium needs `nix-ld`. The flake
> sets `NIX_LD`/`NIX_LD_LIBRARY_PATH` automatically and warns if
> `programs.nix-ld.enable = true;` is missing from your system config.

## Commands

Run these from inside `nix develop`:

| Task                  | Command          |
| --------------------- | ---------------- |
| Install deps          | `pnpm install`   |
| Dev server            | `pnpm dev`       |
| Production build      | `pnpm build`     |
| Preview built client  | `pnpm preview`   |
| Typecheck             | `pnpm typecheck` |
| Unit tests            | `pnpm test`      |
| Unit tests (watch)    | `pnpm test:watch`|
| Lint (Biome)          | `pnpm lint`      |
| Lint + autofix        | `pnpm lint:fix`  |
| Format (Biome)        | `pnpm format`    |
| Lint + typecheck      | `pnpm check`     |
| Deploy to Netlify     | `pnpm deploy`    |

> `package.json` is the source of truth for scripts.

## Conventions

- **TypeScript strict mode** is on. No `any` without a written reason; no
  unchecked `// @ts-ignore`.
- **File-based routing**: route files live under `src/routes/`. Keep route
  components thin — push data loading into loaders and logic into modules
  under `src/lib/` or feature folders.
- **Server functions** (`createServerFn`) are the boundary to the backend.
  Validate all inputs at this boundary.
- **Biome formatting** is authoritative: tabs (width 2), single quotes,
  semicolons as-needed, 80-col lines. Run `pnpm lint:fix` — don't hand-format.
- **Styling** uses the design-token system in `src/styles/`. Reference
  *semantic* tokens (`var(--color-fg)`, `var(--space-md)`), never raw
  primitives or hard-coded values. Type/spacing scales are fluid (`clamp()`).
- **Browser-only libs** (e.g. mapbox-gl) must be dynamically imported inside
  `useEffect` so they stay out of the SSR bundle. See `MapView.tsx`.
- Prefer **small, composable modules** over large files.
- Use the `~/` path alias (maps to `src/`) instead of long relative chains.

## Project layout

```
.
├── flake.nix              # Nix dev environment
├── AGENTS.md              # this file
├── package.json           # scripts & deps (pnpm)
├── pnpm-workspace.yaml     # pnpm settings (allowed native builds)
├── biome.json             # lint + format config
├── vite.config.ts         # Vite + TanStack Start + Netlify plugins
├── tsconfig.json          # TypeScript config (strict)
├── netlify.toml           # Netlify build settings
├── .env.example           # template for local env vars
└── src/
    ├── routes/            # file-based routes (__root.tsx, index.tsx, …)
    ├── components/        # shared UI components (MapView.tsx)
    ├── styles/            # design tokens + global styles
    │   ├── tokens.css     #   primitive + semantic CSS variables (fluid)
    │   └── global.css     #   reset, base elements, layout utilities
    ├── router.tsx         # TanStack Router setup
    ├── routeTree.gen.ts   # GENERATED — do not edit (gitignored)
    └── vite-env.d.ts      # Vite/import.meta.env types
```

## Environment variables

Client-exposed vars **must** be prefixed `VITE_`. Copy `.env.example` to
`.env` (gitignored) and fill in:

- `VITE_MAPBOX_ACCESS_TOKEN` — Mapbox GL token for `MapView`. Without it the
  map renders a graceful "set your token" placeholder.

On Netlify, set the same variable in **Site settings → Environment variables**.

## Deployment (Netlify)

The build is wired for Netlify via `@netlify/vite-plugin-tanstack-start`
(an SSR function is emitted to `.netlify/v1/functions/`). To deploy:

```bash
pnpm deploy          # = netlify deploy (use --prod for production)
```

`netlify.toml` pins the build command, publish dir (`dist/client`), and
Node 24. Continuous deployment from a git repo also works once connected.

## References

Authoritative docs for the core stack — consult these (and prefer them over
guesswork) when implementing features or debugging.

### TanStack Start (full-stack framework)

- Overview & guides: <https://tanstack.com/start/latest/docs/framework/react/overview>
- Server functions (`createServerFn`) — the backend boundary:
  <https://tanstack.com/start/latest/docs/framework/react/server-functions>
- Data loading & SSR: <https://tanstack.com/start/latest/docs/framework/react/ssr>
- Hosting / deployment targets: <https://tanstack.com/start/latest/docs/framework/react/hosting>

### TanStack Router (routing, used by Start)

- Overview: <https://tanstack.com/router/latest/docs/framework/react/overview>
- File-based routing: <https://tanstack.com/router/latest/docs/framework/react/routing/file-based-routing>
- Route loaders & data: <https://tanstack.com/router/latest/docs/framework/react/guide/data-loading>
- Type-safe navigation & params: <https://tanstack.com/router/latest/docs/framework/react/guide/navigation>

### Netlify (hosting)

- TanStack Start on Netlify: <https://docs.netlify.com/build/frameworks/framework-setup-guides/tanstack-start/>
- `@netlify/vite-plugin-tanstack-start`: <https://www.npmjs.com/package/@netlify/vite-plugin-tanstack-start>
- Environment variables: <https://docs.netlify.com/build/environment-variables/overview/>
- `netlify.toml` reference: <https://docs.netlify.com/build/configure-builds/file-based-configuration/>

### Mapbox GL JS (map)

- API reference (`Map`, controls, sources, layers):
  <https://docs.mapbox.com/mapbox-gl-js/api/>
- Guides (getting started, styles, performance):
  <https://docs.mapbox.com/mapbox-gl-js/guides/>
- Built-in style URLs (e.g. `satellite-v9`, `satellite-streets-v12`):
  <https://docs.mapbox.com/api/maps/styles/#mapbox-styles>
- Access tokens & URL restrictions: <https://docs.mapbox.com/help/getting-started/access-tokens/>

## Working agreements for agents

- Always work inside `nix develop`; do not install global tooling.
- Use **pnpm** for every dependency operation (`pnpm add`, `pnpm remove`).
  Never create a `package-lock.json` or `yarn.lock`.
- Run `pnpm check` (lint + typecheck) before declaring a change done.
- Don't commit secrets. Use a `.env` file (gitignored) for local config.
- Keep this file up to date when stack, commands, or conventions change.
