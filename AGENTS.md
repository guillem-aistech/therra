# AGENTS.md

Guidance for AI coding agents (and humans) working in this repository.

## Project

**Therra Space** — building the **Therra Intelligence Platform (TIP)**, a B2B geospatial intelligence MVP. Tagline: *"Measure the pulse of civilization."*

TIP turns public thermal / Earth-observation data into risk intelligence for insurers, infrastructure operators, governments, and energy companies. The core concept is the **Thermal Heartbeat**: every monitored asset (refinery, LNG terminal, data center, desalination plant, power corridor, urban district, …) has a temperature time-series, and deviations from its baseline drive anomaly, risk, and insurance scores. This is a **Phase 0 investor-demo MVP** — it uses mock/seeded data and labels it as such; the pitch narrative leads toward a future dedicated thermal-satellite constellation.

The full product brief lives in [`docs/EARLY_PROPOSAL.md`](docs/EARLY_PROPOSAL.md), the build plan in [`docs/TODO.md`](docs/TODO.md), and the believable-data design in [`docs/MOCK_DATA.md`](docs/MOCK_DATA.md).

> **Scope note:** this is a **frontend-only demo** — no backend, no login, no database. The goal is for investors and audiences to *envision* the product on their **phones and laptops**, so it must be fully responsive and visually polished. The proposal was written as a generic "build from scratch" prompt (React+Tailwind+FastAPI+PostgreSQL+Docker); we **adapt it to this repo**: one TanStack Start codebase, plain CSS design tokens (no Tailwind), and all data served from **static client-side mock modules** (no server functions, no auth). Treat the proposal's backend/auth/stack sections as inspiration, not requirements.

## Stack

| Concern         | Choice                                                  |
| --------------- | ------------------------------------------------------- |
| Language        | TypeScript (strict)                                     |
| Framework       | TanStack Start (full-stack React 19, file-based routing) |
| Router          | TanStack Router                                         |
| Build / dev     | Vite 8                                                  |
| Lint / format   | **Biome** (`biome.json`) — not ESLint/Prettier          |
| Styling         | Plain CSS, **MD3 token system** (`src/styles`) — WCAG AA |
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
- **Styling** uses the **MD3 token system** in `src/styles/`. Reference MD3
  *role* tokens by name (`var(--color-on-surface)`, `var(--color-primary)`,
  `var(--color-outline-variant)`) and typescale roles (`.text-body-large`,
  `var(--text-headline-medium-size)`), never raw hex or component-specific
  names. Color roles are generated from the brand source and verified WCAG AA;
  spacing/type scales are fluid (`clamp()`).
- **Browser-only libs** (e.g. mapbox-gl) must be dynamically imported inside
  `useEffect` so they stay out of the SSR bundle. See `MapView.tsx`.
- Prefer **small, composable modules** over large files.
- Use the `~/` path alias (maps to `src/`) instead of long relative chains.

## Design language — "Operational Clarity"

Clear, straight, function-first — a control-room monitoring tool an infrastructure operator trusts. Blend of **NOC dashboard** (glanceable status grid + alert tables), **Swiss/International typography** (strict grid, typographic discipline), and **enterprise design-system** (sober, accessible, credible components). Deliberately *not* a generic AI-MVP / SaaS look.

- **No decoration:** no gradients, glassmorphism, or soft drop-shadows. Flat surfaces, 1px borders, minimal radius (~2–4px), squared and instrument-like.
- **Palette:** neutral grayscale surfaces, **dark theme by default** (low-glare ops). The **live map ships dark-only**; the light *"report" theme* is a DOM/CSS theme for the `/report` print view only — never a Mapbox `setStyle()` swap (that would wipe layers + feature-state). Status colors are semantic and reserved — Normal = green, Warning = orange, Critical = red — never used for decoration. The **MD3 palette is seeded from the brand amber (`#ffb300`)**: `primary` is amber (links/actions/focus), with `secondary`/`tertiary` supplying cooler/green support tones; the vivid wordmark amber lives in `--color-brand` (mark only).
- **Typography:** MD3 typescale (`display`/`headline`/`title`/`body`/`label`). **Architype Stedelijk** for display/headline (brand display face, falls back to IBM Plex Sans until licensed files are added); **IBM Plex Sans** for UI; **IBM Plex Mono** / tabular figures for all metrics, temperatures, and table numbers so columns align.
- **Layout:** strict 12-column grid, consistent gutters, hard alignment. KPIs as a status-tile grid (number + label + status edge). Data tables are first-class — dense, sortable, status shown via a colored cell/badge, not a tinted card.
- **Charts (Recharts):** thin lines, light gridlines, status-colored series, tabular tooltips — no gradient fills.
- All of the above is expressed through the `src/styles/` semantic tokens — add status + neutral tokens there, never hard-code.

## UX architecture — map-first workspace

There is **no dashboard page**. The map *is* the application; data floats on top of Mapbox as flat panels that read from and write to the map. Every view the proposal asked for is a *setting* of four orthogonal dials, not a separate page:

```
MAP (always there) × LENS (who you are) × SELECTION (what you clicked) × FACET (which aspect)
```

The chosen pattern is a restrained **"Telemetry HUD"** (validated by an adversarial design debate — see `docs/TODO.md`): a dark instrument surface, an information-rich rail, and one signature wow — the **lens re-ramp**.

- **MAP at rest** — near-monochrome dark base; ~40 assets as small **circle markers colored *only* by status** (green/amber/orange/red), radius driven by `zoom × riskScore`. No heatmap, no 3D, no decoration: the map is an instrument bezel.
- **LENS** — a customer-profile config (pure data in `src/lib/lenses/`) that re-skins the workspace so it "talks to" each customer. Switching a lens is a **pure paint/filter swap with the camera held dead still** — palette, radius metric, roster labels, and KPI vocabulary all re-pour over the *same* markers in <1s. This is the demo's signature moment ("one map becomes a different product per customer") and it survives reduced-motion because it is not a camera move. Lenses replace the proposal's six sector dashboards; a new customer type = a new config object, not a new page.
- **INSTRUMENT RAIL** — a severity-sorted roster of named rows (asset · status glyph+label · current °C · 24h Δ). It makes the workspace read as a real ops tool from the first frame, is the reliable tap target on phones, and is the keyboard/screen-reader path to the data.
- **SELECTION + FACET** — clicking an asset (or a roster row) opens a slide-over over the map (`easeTo` + padding recenters it, others dim) with facet tabs (Thermal · Risk · Insurance · Operations · Data). One detail component; facets adapt to lens + asset type. The Thermal Heartbeat always leads the Thermal tab.
- **~3 routes only:** `/` (workspace; lens/asset/facet in the URL → shareable views), `/report` (print-friendly, light DOM theme — not a Mapbox style swap), `/why-satellites` (pitch narrative).
- **Panels (flat, over one `MapCanvas`):** `InstrumentRail` (roster), `SignalRibbon` (lens KPI counts, click-to-filter), `SelectionSlideOver` (facet tabs), `HoverPopup`, `LensSwitcher` + `FacetStrip` (custom Mapbox `IControl`s).
- **Phone:** rail + slide-over collapse into one **bottom-sheet with detents** (peek = KPI chips + top Critical rows; half = roster; full = detail). Map full-bleed behind; lens = top control. Primary selection on phone is tapping a roster row, not hunting a dot.

## Map implementation (Mapbox GL JS)

Concrete plan from the design debate; build onto the existing client-only `MapView.tsx`.

**Use (stable primitives only):**

- **One `GeoJSON` source** with `promoteId: 'assetId'`; push live Heartbeat ticks via `setData()`.
- **Circle layer** as the sole marker layer — `match` on `['get','status']` for color, `interpolate` on `zoom × riskScore` for radius, stroke/accent from `feature-state` via `case`.
- **`step` expression** maps continuous `riskScore` → the four hard status bands (no gradient in status).
- **`feature-state`** (`setFeatureState`/`removeFeatureState`, keyed to `promoteId`) for hover + selection so they survive a lens re-skin; rAF-batch the writes.
- **`setPaintProperty` / `setLayoutProperty` / `setFilter`** are the **lens re-ramp** — never `setData`, never `setStyle`, never a camera move on a lens switch.
- **`querySourceFeatures`** is the single source for KPI counts and the roster (consistent across pan/zoom) — don't also use `queryRenderedFeatures` for counts.
- **Camera:** `easeTo` + `setPadding` to recenter a selected asset clear of panels; `fitBounds`/`cameraForBounds` only on explicit "fit to lens"; `flyTo` for roster jumps.
- **Slots** (`bottom`/`middle`/`top`) for layer order against the Standard style — not `beforeId` — so basemap labels never bury Critical markers.
- **Controls:** restyled `NavigationControl`/`ScaleControl` + custom `IControl`s (lens switcher, facet strip).
- **`Popup`** with a themed `className` (no shadow); keep the hover popup to a sparkline/text and mount the full Recharts chart only in the slide-over, unmounting on close (React-root lifecycle).
- **Mobile:** `cooperativeGestures`, `pitchWithRotate:false`, `touchZoomRotate.disableRotation()`, `ResizeObserver → map.resize()` after sheet-detent changes (debounced).
- **Reduced motion:** camera moves degrade to instant jumps; the lens re-ramp is already motionless.

**Avoid (cut for the demo — cost/perf/brand sinks):** custom `CustomLayerInterface` WebGL pulse; `fill-extrusion`/3D/emissive glow (violates the flat brand); `heatmap` (dishonest at ~40 sparse points); GeoJSON clustering (meaningless at 40 — render all); `mapbox-gl-draw` AOI; a live dark/light `setStyle()` toggle (it wipes sources/layers/feature-state). Ship the **dark-only** live map.

**SSR & token:** `mapbox-gl` touches `window`/WebGL at import — keep every map-touching module behind the existing client-only dynamic import, or SSR breaks on TanStack Start + Netlify. URL-restrict the public `VITE_MAPBOX_ACCESS_TOKEN`. Feature-detect WebGL2 → Mapbox Static Images fallback (a simple still map + markers) for locked-down devices.

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
    │   ├── tokens.css     #   MD3 color + typescale role tokens (fluid)
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
- Style Spec — expressions (`match`/`interpolate`/`step`/`case`):
  <https://docs.mapbox.com/style-spec/reference/expressions/>
- `feature-state` for hover/selection styling:
  <https://docs.mapbox.com/mapbox-gl-js/example/hover-styles/>
- Built-in style URLs (e.g. `satellite-v9`, `satellite-streets-v12`):
  <https://docs.mapbox.com/api/maps/styles/#mapbox-styles>
- Static Images API (WebGL-less fallback): <https://docs.mapbox.com/api/maps/static-images/>
- Access tokens & URL restrictions: <https://docs.mapbox.com/help/getting-started/access-tokens/>

## Working agreements for agents

- Always work inside `nix develop`; do not install global tooling.
- Use **pnpm** for every dependency operation (`pnpm add`, `pnpm remove`).
  Never create a `package-lock.json` or `yarn.lock`.
- Run `pnpm check` (lint + typecheck) before declaring a change done.
- Don't commit secrets. Use a `.env` file (gitignored) for local config.
- Keep this file up to date when stack, commands, or conventions change.
