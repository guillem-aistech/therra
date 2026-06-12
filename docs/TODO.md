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

## 4. Reusable components

- [ ] `StatusBadge`, `RiskScoreCard`, `AssetTypeIcon` (Lucide by type)
- [ ] `ThermalHeartbeatChart`, baseline-comparison chart (Recharts, responsive containers)
- [ ] `AssetMap` (extend `MapView.tsx`: status colors green/yellow/orange/red, per-type icons, popup)
- [ ] `KPIGrid`, `AlertTable`, `AssetTable`, `FilterPanel`, `ReportPreview`

## 5. Pages / routes (`src/routes/`)

No login — app opens straight into the Dashboard.

- [ ] Landing/Dashboard (nav, KPI cards, map, asset table, recent alerts, risk chart)
- [ ] Map view (interactive, color-coded, per-type icons, popups → detail)
- [ ] Assets list (filter by type, status, risk, region, criticality, exposure, anomaly type)
- [ ] Asset detail (header, summary cards, heartbeat, baseline, risk breakdown, observations, alerts, recommended action, insurance + infra panels, data provenance)
- [ ] Alerts page (table + filters)
- [ ] Insurance dashboard
- [ ] Critical Infrastructure dashboard
- [ ] Wildfire & Climate dashboard
- [ ] Gas Flares dashboard
- [ ] Desalination dashboard
- [ ] Power Grid dashboard
- [ ] Reports page (select asset/date-range/type → on-screen, print-friendly report)
- [ ] "Why Therra Satellites?" page (Phase 0 vs dedicated-satellite comparison table)

## 6. Navigation & layout

- [ ] App shell: top nav + sidebar (Dashboard, Map, Assets, Alerts, Insurance, Critical Infrastructure, Wildfire & Climate, Gas Flares, Desalination, Power Grid, Reports, "Why Therra Satellites?")
- [ ] **Mobile nav**: sidebar collapses to a drawer/bottom-nav on phones

## 7. Responsive & design system (priority)

- [ ] Dark theme by default; high contrast; premium space/intelligence feel
- [ ] Extend `src/styles/tokens.css` with status colors + thermal/earth palette (semantic tokens only)
- [ ] **Test every page at phone (~375px), tablet, and laptop widths** — no horizontal scroll, charts/maps/tables reflow gracefully
- [ ] Tables → card lists on narrow screens; map stays usable with touch
- [ ] Loading and empty/error states on all data views

## 8. Reports

- [ ] Report view sections: exec summary, thermal status, heartbeat, anomaly, risk interpretation, insurance + infra implications, recommended actions, data sources, **honest** confidence/limitations
- [ ] Print-friendly layout (PDF export can be mocked)

## 9. Quality & docs

- [ ] `pnpm check` clean (lint + typecheck), no broken imports
- [ ] Verify on a real phone viewport (Playwright or device) before calling it demo-ready
- [ ] Update root `README` for the product (vision, run steps, limitations, roadmap, screenshot placeholders)
- [ ] No TODOs left for core features; every mock labelled "Phase 0 mock"
