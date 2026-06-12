# TODO — Therra Intelligence Platform (TIP) demo

Phase 0 investor-demo MVP. Full brief: [`EARLY_PROPOSAL.md`](EARLY_PROPOSAL.md).

**Scope** (see `AGENTS.md`): **frontend-only** — no backend, no login, no database. Single TanStack Start codebase, plain CSS design tokens (no Tailwind), all data from **static client-side mock modules**. Charts via Recharts, icons via Lucide.

**North star:** investors and audiences open this on their **phones and laptops** and instantly *envision* the Therra solution. Every screen must be responsive and visually convincing. Label mock data "Phase 0 mock".

Legend: `[ ]` todo · `[~]` in progress · `[x]` done.

## 0. Setup & dependencies

- [ ] Add deps with pnpm: `recharts`, `lucide-react`
- [ ] No DB / no server functions — all data lives in `src/lib/data/`

## 1. Domain types

- [ ] Define TS types in `src/lib/types.ts`: `Asset`, `ThermalObservation`, `Alert`, `RiskAssessment`, `Report`
- [ ] Define enums/unions: asset types (14), `Status` (Normal/Watch/Warning/Critical), `Criticality` (Low/Medium/High/Strategic), alert types

## 2. Mock data (static, client-side)

- [ ] 40+ realistic assets across Europe / North Africa / Middle East / global (Barcelona LNG, Tarragona Refinery, Rotterdam Refinery, Frankfurt Data Center, Dubai Desalination, Sicily Gas Flare, Athens Wildfire Zone, …)
- [ ] 90 days of thermal observations per asset (baseline + plausible anomalies)
- [ ] Spread of statuses: some Normal, Watch, Warning, Critical
- [ ] At least one alert per high-risk asset + a risk assessment per asset
- [ ] Deterministic generation (seeded) so the demo looks identical every load

## 3. Analytics (explainable, no black-box AI)

- [ ] `calculateThermalDelta()` — current − baseline
- [ ] `calculateAnomalyScore()` — magnitude + persistence + volatility
- [ ] `calculateRiskScore()` — weighted: anomaly, criticality, exposure, volatility, alert severity, asset-type factor
- [ ] `calculateHealthScore()` — 100 − normalized penalty
- [ ] `classifyStatus()` — thresholds (<30 / 30–55 / 55–75 / ≥75)
- [ ] `calculateFireRiskIndex()`, `calculateBusinessInterruptionRisk()`, `calculateThermalVolatility()`
- [ ] `generateAssetRecommendations()` + human-readable score **explanations** (the "why")

## UX architecture — map-first workspace (no dashboard)

The map IS the application. No dashboard page. Data floats on top of Mapbox as panels that read from and write to the map. Every view the proposal asked for is a *setting* of four orthogonal dials, not a separate page:

```
MAP (always there)  ×  LENS (who you are)  ×  SELECTION (what you clicked)  ×  FACET (which aspect)
```

- **LENS** = a customer profile config (pure data) that re-skins the same workspace so it "talks to" each customer — swaps map layer, KPI signals, vocabulary, and default filter. The map stays put on switch (re-focus, not page change). Lenses: Infrastructure Operator (default), Insurer/Underwriter, Energy & Gas, Water/Desalination, Grid Operator, Climate/Civil Protection. New customer type = new config object, no new page. **This replaces the 6 sector dashboards.**
- **SELECTION + FACET** = click an asset → slide-over detail panel over the map (fly-to, others dim), with facet tabs: Thermal · Risk · Insurance · Operations · Data. One detail component; facets adapt to lens + asset type. Thermal Heartbeat always present.

## 4. Reusable components

The whole app is ~6 floating panels + a few primitives.

- [ ] `MapCanvas` (extend `MapView.tsx`: lens-driven layers, status colors green/yellow/orange/red, per-type icons, fly-to, hover sparkline)
- [ ] `LensSwitcher` (customer profile selector; drives layer + signals + vocabulary)
- [ ] `SignalRibbon` (KPI status-tiles, lens-driven; tile click filters the map)
- [ ] `AssetListPanel` (filterable, collapsible; selection syncs to map)
- [ ] `AssetDetailPanel` (slide-over with facet tabs)
- [ ] `AlertsPanel` (lens-filtered alert list)
- [ ] `FilterControls`, `StatusBadge`, `RiskScoreCard`, `AssetTypeIcon` (Lucide), `ThermalHeartbeatChart` + baseline chart (Recharts)

## 5. Routes (`src/routes/`)

No login. ~3 routes total — monitoring all happens in the workspace via lens/asset/facet.

- [ ] `/` — map workspace. Lens, selected asset, and facet live in the URL so views are shareable (`/?lens=insurer&asset=BCN-LNG-01&facet=risk`)
- [ ] `/report` — print-friendly report from the current selection/lens
- [ ] `/why-satellites` — Phase 0 vs dedicated-satellite pitch narrative

## 6. Lens configs & interactions

- [ ] Define lens config objects in `src/lib/lenses/`: { map layer, KPI signal set, asset filter, detail-facet emphasis, vocabulary, accent }
- [ ] Click asset → detail panel + map fly-to + dim others; hover → heartbeat sparkline tooltip
- [ ] Filter / KPI-tile click → live marker update (e.g. "Critical (3)" → show only those)
- [ ] Lens switch → layer + signals + words morph, selection preserved
- [ ] **Phone:** panels become bottom-sheets over the map; lens = top dropdown; KPI ribbon scrolls horizontally; detail = full-height sheet; map always behind

## 7. Design system — "Operational Clarity" (priority)

Direction: NOC dashboard + Swiss typography + enterprise design-system. Clear, straight, no decoration. Not a generic AI-MVP look. See `AGENTS.md` → Design language.

- [ ] Add IBM Plex Sans + IBM Plex Mono (self-hosted); mono/tabular figures for all metrics
- [ ] Extend `src/styles/tokens.css`: neutral grayscale surfaces/borders + reserved status tokens (Normal/Watch/Warning/Critical) + one interactive accent
- [ ] Dark theme by default (low-glare ops); light "report" theme for Reports/print
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
