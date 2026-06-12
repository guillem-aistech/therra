# TODO — Therra Intelligence Platform (TIP) demo

Phase 0 investor-demo MVP. Brief: [`EARLY_PROPOSAL.md`](EARLY_PROPOSAL.md) · architecture & design: [`../AGENTS.md`](../AGENTS.md) · believable data: [`MOCK_DATA.md`](MOCK_DATA.md).

**Scope** (see `AGENTS.md`): **frontend-only** — no backend, no login, no database. Single TanStack Start codebase, plain CSS design tokens (no Tailwind), all data from **static client-side mock modules**. Charts via Recharts, icons via Lucide.

**North star:** investors and audiences open this on their **phones and laptops** and instantly *envision* the Therra solution. Every screen must be responsive and visually convincing. Label mock data "Phase 0 mock".

Legend: `[ ]` todo · `[~]` in progress · `[x]` done.

## 0. Setup & dependencies

- [x] Add deps at **latest** versions: `pnpm add recharts@latest lucide-react@latest` (no `@playwright/test` — UI is inspected via the Playwright MCP, no E2E test files)
- [x] Verify **Mapbox GL JS v3+** (slots + Standard style) and add `import 'mapbox-gl/dist/mapbox-gl.css'`
- [x] Self-host fonts via `@fontsource` (latest): IBM Plex Sans, IBM Plex Mono, **Chakra Petch** (display/headline); wordmark ships as outlined paths — tokens already reference the families
- [x] Set the app shell dark: `data-theme="dark"` on `<html>` in `__root.tsx`
- [x] No DB / no server functions — all data lives in `src/lib/data/`

## 1. Domain types

- [x] Core types in `src/lib/types.ts`: `Asset` (+ optional `geometry_geojson` and lens metrics: `operational_load_pct`, `capacity_utilization_pct`, `flare_intensity_mw?`, `hazard_proximity_score`), `ThermalObservation`, `Alert`, `RiskAssessment`, `Report`, `EOSource`, `Dataset`, `Lens`
- [x] Enums/unions: `AssetType` (14), `Status` (Normal/Watch/Warning/Critical), `Criticality` (Low/Medium/High/Strategic), `Severity`, `AlertType`, `Scenario`, `Facet` (thermal/risk/insurance/operations/data), `LensId`

## 2. Mock data (static, client-side) — design in [`MOCK_DATA.md`](MOCK_DATA.md)

Realism = **internal consistency**: every score/status/alert/chart derives from one generated thermal series. Build in `src/lib/data/`.

- [x] Seeded PRNG (`rng.ts`: xmur3 + mulberry32 + gaussian); fixed `DEMO_NOW` = 2026-06-12, `OBSERVATION_DAYS` = 90 — no `Date.now()`/`Math.random()`
- [x] Hand-author the **44-asset catalog** (`catalog.ts`) per the MOCK_DATA §5 table: identity, geo (+ `geometry_geojson` for corridors/pipelines/zones), type, criticality, exposure, lens metrics, climate params, scenario
- [x] Climate + seasonal model (`climate.ts`) and scenario anomaly shapes (`scenarios.ts`: spike / ramp / drop / flare / plume)
- [x] Thermal generator (`thermal.ts`): 90 obs/asset with baseline, delta, brightness, cloud gaps + confidence
- [x] Derive current/baseline/delta/anomaly/risk/health/status from the series via §3 (never hand-set)
- [x] `alerts.ts` (alerts from injected events; type valid for asset type, severity from anomaly score) + `risk.ts` (RiskAssessment + explanation citing real numbers)
- [x] EO provenance catalog (`provenance.ts`: Landsat / Sentinel-3 / MODIS / VIIRS / ECOSTRESS) + Phase 0 limitations copy
- [x] `index.ts` assembles the dataset once + typed selectors; status mix / no future dates / determinism verified

## 3. Analytics (explainable, no black-box AI)

- [x] `calculateThermalDelta()` — current − baseline
- [x] `calculateAnomalyScore()` — magnitude + persistence + volatility
- [x] `calculateRiskScore()` — weighted: anomaly, criticality, exposure, volatility, alert severity, asset-type factor
- [x] `calculateHealthScore()` — 100 − normalized penalty
- [x] `classifyStatus()` — thresholds (<30 / 30–55 / 55–75 / ≥75)
- [x] `calculateFireRiskIndex()`, `calculateBusinessInterruptionRisk()`, `calculateThermalVolatility()`
- [x] `generateAssetRecommendations()` + human-readable score **explanations** (the "why")

## UX architecture — map-first workspace (no dashboard)

Full spec in [`../AGENTS.md`](../AGENTS.md) → "UX architecture" + "Map implementation". Decided pattern (from the adversarial design debate): a restrained **Telemetry HUD** — dark instrument map, an **instrument rail** (named status roster), and one signature wow, the **lens re-ramp** (a lens switch re-pours color / radius / roster / KPIs over the *same* markers with the camera held still). The four dials:

```
MAP (always there)  ×  LENS (who you are)  ×  SELECTION (what you clicked)  ×  FACET (which aspect)
```

- **LENS** replaces the 6 sector dashboards: Infrastructure Operator (default), Insurer/Underwriter, Energy & Gas, Water/Desalination, Grid Operator, Climate/Civil Protection. New customer = new config object, no new page.
- **SELECTION + FACET** = click asset/row → slide-over with tabs Thermal · Risk · Insurance · Operations · Data. Heartbeat always leads.

## 4. Reusable components

The whole app is ~6 floating panels over one map + a few primitives.

- [x] `MapCanvas` (`components/map/`): single GeoJSON source; circle (points) + line (corridors/pipelines) + flat fill (zones/districts) layers; feature-state hover/select; lens re-ramp
- [x] `InstrumentRail` — severity-sorted roster of named rows (asset · status glyph+label · current °C · 24h Δ); cross-highlights the map
- [x] `SignalRibbon` — lens KPI counts ("3 Critical / 6 Warning / …") as click-to-filter chips (counts derived from the dataset; equivalent to `querySourceFeatures` for static data)
- [x] `SelectionSlideOver` — facet tabs; Thermal tab leads with the 90-day Heartbeat
- [x] `HoverPopup` — themed, no-shadow; sparkline/text only (full chart lives in the slide-over)
- [x] `LensSwitcher` + `FacetStrip` — accessible HTML controls (tablist) over the map
- [x] Primitives: `StatusBadge` (glyph+label, never color alone), `AssetTypeIcon` (Lucide), `RiskScoreCard`, `ThermalHeartbeatChart` + baseline reference (Recharts)

## 5. Routes (`src/routes/`)

No login. ~3 routes total — monitoring all happens in the workspace via lens/asset/facet.

- [ ] `/` — map workspace. Lens, selected asset, and facet live in the URL so views are shareable (`/?lens=insurer&asset=ES-LNG-BCN-01&facet=risk`)
- [ ] Typed **search-param schema** (TanStack Router `validateSearch`) for `lens`/`asset`/`facet`, two-way synced with map + selection (default `lens=infra-operator`)
- [ ] `/report` — print-friendly report; the route sets `<html data-theme="light">`
- [ ] `/why-satellites` — Phase 0 vs dedicated-satellite pitch (comparison table + satellite requirements from the brief)

## 6. Map & lens implementation (Mapbox GL JS) — details in [`../AGENTS.md`](../AGENTS.md)

- [ ] One GeoJSON source `promoteId:'assetId'`; **circle** (points) + thin **line** (corridors/pipelines) + flat **fill** (zones/districts) layers, status via `match`; `interpolate` (zoom×risk→radius), `step` (risk→status bands). Mapbox v3+
- [ ] `feature-state` hover + selection (keyed to promoteId, rAF-batched); themed `Popup`
- [ ] Lens configs in `src/lib/lenses/`: { palette/`match` table, radius metric, `setFilter` asset classes, facet emphasis, vocabulary, accent }
- [ ] **Lens re-ramp** via `setPaintProperty`/`setLayoutProperty`/`setFilter` only — never `setData`/`setStyle`/camera move; selection + status colors survive
- [ ] `querySourceFeatures` = single source for KPI counts + roster; tile/chip click → `setFilter`
- [ ] Data is static/deterministic — `setData()` only re-applies derived state (filters/selection), not live streaming
- [ ] Selection: `easeTo` + `setPadding` to clear panels; `flyTo` for roster jumps; slots for layer order
- [ ] Mobile: bottom-sheet detents, `cooperativeGestures`, rotation disabled, `ResizeObserver→resize()`; reduced-motion = instant camera
- [ ] SSR: keep all map modules behind the client-only dynamic import; URL-restrict the token; WebGL2 → Static Images fallback
- [ ] **Cut for demo:** custom WebGL pulse, fill-extrusion/3D, heatmap, clustering, mapbox-gl-draw, live `setStyle()` dark/light toggle (dark-only map)

## 7. Design system — MD3 tokens + "Operational Clarity" treatment (priority)

Tokens already exist (`tokens.css`: MD3 roles from `#ffb300`, IBM Plex + Chakra Petch, WCAG AA). Apply the flat instrument treatment *on top of* them. See `AGENTS.md` → Design language.

- [x] **Status ramp:** add a dedicated 4-stop `--status-normal/watch/warning/critical` (+ `on-`/`container`) to `tokens.css`, generated with the Material utilities. ⚠️ Four mutually-distinct hues, each distinct from amber `primary`/`brand`; **Watch ≠ brand amber**; fix the dark-mode `warning ≈ error` collision. Verify AA on `surface`/`surface-container*`
- [ ] **Interactive accent = `--color-primary`** (amber); brand amber `--color-brand` stays mark-only
- [ ] **Theme:** app `<html data-theme="dark">`; `/report` route uses `data-theme="light"`. For per-subtree theming, refactor token blocks onto `[data-theme]` selectors (currently `:root`-scoped)
- [ ] **Fonts:** `font-feature-settings: 'tnum' 1` (tabular) on all metrics/tables; families wired in §0
- [ ] **Flat-on-MD3:** hierarchy via `surface-container*` tiers + `--color-outline(-variant)` 1px borders — **not** `--color-shadow`/elevation; small radii (`--radius-xs/sm`); no gradients/glass
- [ ] Strict 12-col grid + status-tile KPI grid; data tables first-class (dense, sortable, status via glyph+label cell, never color alone)
- [ ] Loading and empty/error states on all data views

## 8. Mobile & accessibility (priority — phones are the demo device)

- [ ] **Test every view at** phone `390×844` & `360×740`, tablet `768`, laptop `1280` (Playwright MCP, §10): no horizontal overflow, charts/tables reflow, map stays touch-usable
- [ ] Full-bleed map uses `100dvh`/`100svh` (not `vh`); honor `env(safe-area-inset-*)` (notch); `overscroll-behavior: contain` on sheets; lock body scroll behind the bottom-sheet
- [ ] Bottom-sheet detents (peek/half/full); rail rows are the primary tap target (≥44px); test portrait **and** landscape phone
- [ ] Keyboard: rail rows focusable + arrow-nav; focus trap + ESC in `SelectionSlideOver`/sheet; visible focus rings (`--color-primary`)
- [ ] `aria-label` on the map canvas + `mapbox-gl-accessibility` plugin; the roster is the non-map data path
- [ ] Respect `prefers-reduced-motion` (tokens zero durations; Mapbox camera → instant); re-verify status-color contrast (AA) on dark

## 9. Reports

- [ ] Report types (from the brief): Infrastructure Health · Insurance Risk · Thermal Anomaly · Urban Heat · Wildfire Risk · Gas Flare Activity · Desalination Thermal Discharge
- [ ] Report view sections: exec summary, thermal status, heartbeat, anomaly, risk interpretation, insurance + infra implications, recommended actions, data sources, **honest** confidence/limitations
- [ ] Print-friendly layout (light theme via route `data-theme`); PDF export mocked (`window.print()`)

## 10. Quality & docs

- [ ] `pnpm check` clean (lint + typecheck), no broken imports
- [ ] Playwright **MCP** responsive pass at `390×844` / `360×740` / `768` / `1280` — screenshots, console clean, no overflow (manual, no test files; see `AGENTS.md` → Viewing & verifying the UI)
- [ ] Update root `README` for the product (vision, run steps, limitations, roadmap, screenshot placeholders)
- [ ] No TODOs left for core features; every mock labelled "Phase 0 mock"
