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
| UI inspection   | Playwright **via MCP** — manual responsive checks (no E2E test files) |
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

- **No decoration:** no gradients, glassmorphism, or soft drop-shadows. Flat surfaces with `--color-outline(-variant)` 1px borders and `surface-container*` tiers for hierarchy — **not** MD3 elevation / `--color-shadow`. Minimal radius (`--radius-xs/sm`), squared and instrument-like.
- **Palette:** **MD3 roles seeded from the brand amber (`#ffb300`)** — warm-neutral surfaces, not literal grayscale. `--color-primary` (amber) is the single interactive accent (links / actions / focus / selection ring); the vivid wordmark amber `--color-brand` is **mark-only, never a UI or status signal**.
- **Theme:** the app shell forces **dark** by setting `data-theme="dark"` on `<html>` (the tokens default `:root` to light). The **live map ships dark-only**. The light *"report" theme* applies to the `/report` route only, via that route's `<html data-theme="light">` (a DOM/CSS theme, never a Mapbox `setStyle()` swap — that would wipe layers + feature-state). ⚠️ Per-subtree theming is impossible with the current `:root`-scoped tokens — theme whole routes, or refactor the value blocks onto `[data-theme]` selectors usable on any element.
- **Status colors** are semantic, reserved (never decoration), and need **four mutually-distinct hues**: Normal · Watch · Warning · Critical. ⚠️ MD3 ships only `success`/`warning`/`error` (three) and in **dark mode `--color-warning` ≈ `--color-error`** (salmon vs pink-red) — too close to separate Warning from Critical. Define a dedicated 4-stop `--status-*` ramp (generated with the same Material utilities), each distinct from the others *and* from the amber `primary`/`brand`; **Watch must not be the brand amber**. Always pair the color with a glyph + label (never color alone).
- **Typography:** MD3 typescale (`display`/`headline`/`title`/`body`/`label`). **Chakra Petch** (free, squared geometric) for display/headline; **IBM Plex Sans** for UI; **IBM Plex Mono** / tabular figures for all metrics, temperatures, and table numbers so columns align. All self-hosted via fontsource. (The wordmark logo itself remains Architype Stedelijk, shipped as outlined paths.)
- **Layout:** strict 12-column grid, consistent gutters, hard alignment. KPIs as a status-tile grid (number + label + status edge). Data tables are first-class — dense, sortable, status shown via a colored cell/badge, not a tinted card.
- **Charts (Recharts):** thin lines, light gridlines, status-colored series, tabular tooltips — no gradient fills.
- All of the above is expressed through the `src/styles/` MD3 tokens — add the `--status-*` ramp there (verify WCAG AA on `surface` / `surface-container*` in dark), never hard-code hex.

## UX architecture — map-first workspace

There is **no dashboard page**. The map *is* the application; data floats on top of Mapbox as flat panels that read from and write to the map. Every view the proposal asked for is a *setting* of four orthogonal dials, not a separate page:

```
MAP (always there) × LENS (who you are) × SELECTION (what you clicked) × FACET (which aspect)
```

The chosen pattern is a restrained **"Telemetry HUD"** (validated by an adversarial design debate — see `docs/TODO.md`): a dark instrument surface, an information-rich rail, and one signature wow — the **lens re-ramp**.

- **MAP at rest** — near-monochrome dark base; ~40 assets as small **markers colored *only* by the four `--status-*` tokens** (Normal/Watch/Warning/Critical), radius driven by `zoom × riskScore`. Point assets use a circle layer; **corridors/pipelines use a thin status-colored `line` layer and zones/districts a flat low-opacity `fill`** (no extrusion). No heatmap, no 3D, no decoration: the map is an instrument bezel.
- **LENS** — a customer-profile config (pure data in `src/lib/lenses/`) that re-skins the workspace so it "talks to" each customer. Switching a lens is a **pure paint/filter swap with the camera held dead still** — palette, radius metric, roster labels, and KPI vocabulary all re-pour over the *same* markers in <1s. This is the demo's signature moment ("one map becomes a different product per customer") and it survives reduced-motion because it is not a camera move. Lenses replace the proposal's six sector dashboards; a new customer type = a new config object, not a new page.
- **INSTRUMENT RAIL** — a severity-sorted roster of named rows (asset · status glyph+label · current °C · 24h Δ). It makes the workspace read as a real ops tool from the first frame, is the reliable tap target on phones, and is the keyboard/screen-reader path to the data.
- **SELECTION + FACET** — clicking an asset (or a roster row) opens a slide-over over the map (`easeTo` + padding recenters it, others dim) with facet tabs (Thermal · Risk · Insurance · Operations · Data). One detail component; facets adapt to lens + asset type. The Thermal Heartbeat always leads the Thermal tab.
- **~3 routes only:** `/` (workspace; lens/asset/facet in the URL → shareable views), `/report` (print-friendly, light DOM theme — not a Mapbox style swap), `/why-satellites` (pitch narrative).
- **Panels (flat, over one `MapCanvas`):** `InstrumentRail` (roster), `SignalRibbon` (lens KPI counts, click-to-filter), `SelectionSlideOver` (facet tabs), `HoverPopup`, `LensSwitcher` + `FacetStrip` (custom Mapbox `IControl`s).
- **Phone:** rail + slide-over collapse into one **bottom-sheet with detents** (peek = KPI chips + top Critical rows; half = roster; full = detail). Map full-bleed behind; lens = top control. Primary selection on phone is tapping a roster row, not hunting a dot.

## Map implementation (Mapbox GL JS)

Concrete plan from the design debate; build onto the existing client-only `MapView.tsx`.

**Use (stable primitives only):**

- **One `GeoJSON` source** with `promoteId: 'assetId'`. Data is static/deterministic — use `setData()` only to re-apply derived state (filters/selection), **not** to stream live values.
- **Circle layer** for point assets — `match` on `['get','status']` for color, `interpolate` on `zoom × riskScore` for radius, stroke/accent from `feature-state` via `case`. Plus a thin **`line`** layer (corridors/pipelines) and a flat **`fill`** layer (zones/districts), both status-colored; each area asset also carries a representative point for the roster/selection.
- **`step` expression** maps continuous `riskScore` → the four hard status bands (no gradient in status).
- **`feature-state`** (`setFeatureState`/`removeFeatureState`, keyed to `promoteId`) for hover + selection so they survive a lens re-skin; rAF-batch the writes.
- **`setPaintProperty` / `setLayoutProperty` / `setFilter`** are the **lens re-ramp** — never `setData`, never `setStyle`, never a camera move on a lens switch.
- **`querySourceFeatures`** is the single source for KPI counts and the roster (consistent across pan/zoom) — don't also use `queryRenderedFeatures` for counts.
- **Camera:** `easeTo` + `setPadding` to recenter a selected asset clear of panels; `fitBounds`/`cameraForBounds` only on explicit "fit to lens"; `flyTo` for roster jumps.
- **Slots** (`bottom`/`middle`/`top`) for layer order against the Standard style — not `beforeId` — so basemap labels never bury Critical markers. (Requires **Mapbox GL JS v3+**; verify the installed version and import `mapbox-gl/dist/mapbox-gl.css`.)
- **Controls:** restyled `NavigationControl`/`ScaleControl` + custom `IControl`s (lens switcher, facet strip).
- **`Popup`** with a themed `className` (no shadow); keep the hover popup to a sparkline/text and mount the full Recharts chart only in the slide-over, unmounting on close (React-root lifecycle).
- **Mobile:** `cooperativeGestures`, `pitchWithRotate:false`, `touchZoomRotate.disableRotation()`, `ResizeObserver → map.resize()` after sheet-detent changes (debounced).
- **Reduced motion:** camera moves degrade to instant jumps; the lens re-ramp is already motionless.

**Avoid (cut for the demo — cost/perf/brand sinks):** custom `CustomLayerInterface` WebGL pulse; `fill-extrusion`/3D/emissive glow (violates the flat brand); `heatmap` (dishonest at ~40 sparse points); GeoJSON clustering (meaningless at 40 — render all); `mapbox-gl-draw` AOI; a live dark/light `setStyle()` toggle (it wipes sources/layers/feature-state). Ship the **dark-only** live map.

**SSR & token:** `mapbox-gl` touches `window`/WebGL at import — keep every map-touching module behind the existing client-only dynamic import, or SSR breaks on TanStack Start + Netlify. URL-restrict the public `VITE_MAPBOX_ACCESS_TOKEN`. Feature-detect WebGL2 → Mapbox Static Images fallback (a simple still map + markers) for locked-down devices.

## Viewing & verifying the UI (Playwright)

**Look at the UI — don't just trust the code.** This matters most for **mobile responsiveness** (the demo is opened on phones). A Playwright browser is available via MCP; use it to drive the running app, and capture a screenshot set before declaring any UI change done.

1. The dev server usually runs at <http://localhost:3000> (the user runs it). If it isn't up, start it yourself (`pnpm dev`). Open it in the Playwright MCP browser.
2. **Check these viewports on every layout change:** phone `390×844` (iPhone) and `360×740` (small Android), tablet `768×1024`, laptop `1280×800`. Screenshot each.
3. At each width verify: **no horizontal scroll/overflow**; the map stays full-bleed and touch-usable; the rail collapses to the bottom-sheet with working detents (peek/half/full); text and touch targets are legible (≥44px); `SelectionSlideOver` and `LensSwitcher` work.
4. Exercise the flows: switch lenses (the re-ramp), select an asset (slide-over + recenter), open a facet tab, filter via a KPI chip.
5. Read the **browser console** after each interaction (token, WebGL, React warnings).
6. Emulate `prefers-reduced-motion: reduce` (camera jumps are instant) and confirm the dark theme renders; emulate `prefers-color-scheme` for the `/report` light view; test **portrait and landscape** phone.

This is **interactive inspection via the Playwright MCP** — do **not** add `@playwright/test` or commit E2E spec files. The `verify` and `run` skills wrap this flow if you prefer.

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
- **Always add/upgrade deps at the latest version** (`pnpm add <pkg>@latest`);
  don't pin to an older major without a written reason.
- Run `pnpm check` (lint + typecheck) before declaring a change done.
- Don't commit secrets. Use a `.env` file (gitignored) for local config.
- Keep this file up to date when stack, commands, or conventions change.
