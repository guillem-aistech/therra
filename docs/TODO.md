# TODO — Therra Intelligence Platform (TIP) demo

Phase 0 investor-demo MVP. Brief: [`EARLY_PROPOSAL.md`](EARLY_PROPOSAL.md) · architecture & design: [`../AGENTS.md`](../AGENTS.md) · believable data: [`MOCK_DATA.md`](MOCK_DATA.md).

**Scope** (see `AGENTS.md`): **frontend-only** — no backend, no login, no database. Single TanStack Start codebase, plain CSS design tokens (no Tailwind), all data from **static client-side mock modules**. Charts via Recharts, icons via Lucide.

**North star:** investors and audiences open this on their **phones and laptops** and instantly *envision* the Therra solution. Every screen must be responsive and visually convincing. Label mock data "Phase 0 mock".

Legend: `[ ]` todo · `[~]` in progress · `[x]` done.

## 0. Setup & dependencies

- [ ] Add deps with pnpm: `recharts`, `lucide-react`
- [ ] No DB / no server functions — all data lives in `src/lib/data/`

## 1. Domain types

- [ ] Define TS types in `src/lib/types.ts`: `Asset`, `ThermalObservation`, `Alert`, `RiskAssessment`, `Report`
- [ ] Define enums/unions: asset types (14), `Status` (Normal/Watch/Warning/Critical), `Criticality` (Low/Medium/High/Strategic), alert types

## 2. Mock data (static, client-side) — design in [`MOCK_DATA.md`](MOCK_DATA.md)

Realism = **internal consistency**: every score/status/alert/chart derives from one generated thermal series. Build in `src/lib/data/`.

- [ ] Seeded PRNG (`rng.ts`: xmur3 + mulberry32 + gaussian); fixed `DEMO_NOW` = 2026-06-12, `OBSERVATION_DAYS` = 90 — no `Date.now()`/`Math.random()`
- [ ] Hand-author the **44-asset catalog** (`catalog.ts`) per the MOCK_DATA §5 table: identity, geo, type, criticality, exposure, lens metrics, climate params, scenario
- [ ] Climate + seasonal model (`climate.ts`) and scenario anomaly shapes (`scenarios.ts`: spike / ramp / drop / flare / plume)
- [ ] Thermal generator (`thermal.ts`): 90 obs/asset with baseline, delta, brightness, cloud gaps + confidence
- [ ] Derive current/baseline/delta/anomaly/risk/health/status from the series via §3 (never hand-set)
- [ ] `alerts.ts` (alerts from injected events; type valid for asset type, severity from anomaly score) + `risk.ts` (RiskAssessment + explanation citing real numbers)
- [ ] EO provenance catalog (`provenance.ts`: Landsat / Sentinel-3 / MODIS / VIIRS / ECOSTRESS) + Phase 0 limitations copy
- [ ] `index.ts` assembles the dataset once + typed selectors; pass the MOCK_DATA §11 QA checklist (status mix, no future dates, determinism)

## 3. Analytics (explainable, no black-box AI)

- [ ] `calculateThermalDelta()` — current − baseline
- [ ] `calculateAnomalyScore()` — magnitude + persistence + volatility
- [ ] `calculateRiskScore()` — weighted: anomaly, criticality, exposure, volatility, alert severity, asset-type factor
- [ ] `calculateHealthScore()` — 100 − normalized penalty
- [ ] `classifyStatus()` — thresholds (<30 / 30–55 / 55–75 / ≥75)
- [ ] `calculateFireRiskIndex()`, `calculateBusinessInterruptionRisk()`, `calculateThermalVolatility()`
- [ ] `generateAssetRecommendations()` + human-readable score **explanations** (the "why")

## UX architecture — map-first workspace (no dashboard)

Full spec in [`../AGENTS.md`](../AGENTS.md) → "UX architecture" + "Map implementation". Decided pattern (from the adversarial design debate): a restrained **Telemetry HUD** — dark instrument map, an **instrument rail** (named status roster), and one signature wow, the **lens re-ramp** (a lens switch re-pours color / radius / roster / KPIs over the *same* markers with the camera held still). The four dials:

```
MAP (always there)  ×  LENS (who you are)  ×  SELECTION (what you clicked)  ×  FACET (which aspect)
```

- **LENS** replaces the 6 sector dashboards: Infrastructure Operator (default), Insurer/Underwriter, Energy & Gas, Water/Desalination, Grid Operator, Climate/Civil Protection. New customer = new config object, no new page.
- **SELECTION + FACET** = click asset/row → slide-over with tabs Thermal · Risk · Insurance · Operations · Data. Heartbeat always leads.

## 4. Reusable components

The whole app is ~6 floating panels over one map + a few primitives.

- [ ] `MapCanvas` (extend `MapView.tsx`): single GeoJSON source, circle layer (status color + zoom×risk radius), feature-state hover/select, lens re-ramp
- [ ] `InstrumentRail` — severity-sorted roster of named rows (asset · status glyph+label · current °C · 24h Δ); cross-highlights the map
- [ ] `SignalRibbon` — lens KPI counts ("3 Critical / 7 Warning / …") as click-to-filter chips from `querySourceFeatures`
- [ ] `SelectionSlideOver` — facet tabs; Thermal tab leads with the 90-day Heartbeat
- [ ] `HoverPopup` — themed, no-shadow; sparkline/text only (full chart lives in the slide-over)
- [ ] `LensSwitcher` + `FacetStrip` — custom Mapbox `IControl`s
- [ ] Primitives: `StatusBadge` (glyph+label, never color alone), `AssetTypeIcon` (Lucide), `RiskScoreCard`, `ThermalHeartbeatChart` + baseline chart (Recharts)

## 5. Routes (`src/routes/`)

No login. ~3 routes total — monitoring all happens in the workspace via lens/asset/facet.

- [ ] `/` — map workspace. Lens, selected asset, and facet live in the URL so views are shareable (`/?lens=insurer&asset=BCN-LNG-01&facet=risk`)
- [ ] `/report` — print-friendly report from the current selection/lens
- [ ] `/why-satellites` — Phase 0 vs dedicated-satellite pitch narrative

## 6. Map & lens implementation (Mapbox GL JS) — details in [`../AGENTS.md`](../AGENTS.md)

- [ ] One GeoJSON source `promoteId:'assetId'`; circle layer with `match` (status→color), `interpolate` (zoom×risk→radius), `step` (risk→status bands)
- [ ] `feature-state` hover + selection (keyed to promoteId, rAF-batched); themed `Popup`
- [ ] Lens configs in `src/lib/lenses/`: { palette/`match` table, radius metric, `setFilter` asset classes, facet emphasis, vocabulary, accent }
- [ ] **Lens re-ramp** via `setPaintProperty`/`setLayoutProperty`/`setFilter` only — never `setData`/`setStyle`/camera move; selection + status colors survive
- [ ] `querySourceFeatures` = single source for KPI counts + roster; tile/chip click → `setFilter`
- [ ] Selection: `easeTo` + `setPadding` to clear panels; `flyTo` for roster jumps; slots for layer order
- [ ] Mobile: bottom-sheet detents, `cooperativeGestures`, rotation disabled, `ResizeObserver→resize()`; reduced-motion = instant camera
- [ ] SSR: keep all map modules behind the client-only dynamic import; URL-restrict the token; WebGL2 → Static Images fallback
- [ ] **Cut for demo:** custom WebGL pulse, fill-extrusion/3D, heatmap, clustering, mapbox-gl-draw, live `setStyle()` dark/light toggle (dark-only map)

## 7. Design system — "Operational Clarity" (priority)

Direction: NOC dashboard + Swiss typography + enterprise design-system. Clear, straight, no decoration. Not a generic AI-MVP look. See `AGENTS.md` → Design language.

- [ ] Add IBM Plex Sans + IBM Plex Mono (self-hosted); mono/tabular figures for all metrics
- [ ] Extend `src/styles/tokens.css`: neutral grayscale surfaces/borders + reserved status tokens (Normal/Watch/Warning/Critical) + one interactive accent
- [ ] Dark theme by default (low-glare ops). Live map is dark-only; light "report" theme is DOM/CSS for `/report` only (no Mapbox `setStyle()` swap)
- [ ] Flat components: 1px borders, minimal radius, no gradients/glass/soft-shadows
- [ ] Strict 12-col grid + status-tile KPI grid; data tables first-class (dense, sortable, status via colored cell/badge)
- [ ] **Test every view/panel at phone (~375px), tablet, and laptop widths** — no horizontal scroll, charts/tables reflow gracefully, map stays touch-usable
- [ ] Panels → bottom-sheets on narrow screens; tables → card lists
- [ ] Loading and empty/error states on all data views

## 8. Reports

- [ ] Report view sections: exec summary, thermal status, heartbeat, anomaly, risk interpretation, insurance + infra implications, recommended actions, data sources, **honest** confidence/limitations
- [ ] Print-friendly layout (PDF export can be mocked)

## 9. Quality & docs

- [ ] `pnpm check` clean (lint + typecheck), no broken imports
- [ ] Verify on a real phone viewport (Playwright or device) before calling it demo-ready
- [ ] Update root `README` for the product (vision, run steps, limitations, roadmap, screenshot placeholders)
- [ ] No TODOs left for core features; every mock labelled "Phase 0 mock"
