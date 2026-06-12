# MOCK_DATA.md — making the Phase 0 data look real

How the Therra demo generates believable thermal-intelligence data. Frontend-only, static, deterministic. See [`AGENTS.md`](../AGENTS.md) and [`TODO.md`](TODO.md).

## 1. Principles (the believability contract)

Realism here is **not** "more elaborate random numbers" — it is **internal consistency**. An investor or operator will click into a Critical asset and the whole story must hold together.

1. **One source of truth per asset: the thermal series.** `current_temperature_c`, `baseline_temperature_c`, `thermal_delta_c`, `anomaly_score`, `risk_score`, `health_score`, and `status` are all **computed** from the generated `ThermalObservation[]` plus asset attributes via the §3 analytics functions — never hand-set independently. Random, mutually-contradicting fields are the #1 "AI-generated" tell.
2. **Status follows the math.** The badge on the map equals `classifyStatus(risk_score)`. A red asset *must* show a visible anomaly in its recent heartbeat, a large delta, and a matching alert.
3. **Every alert is evidenced.** Each alert points at a real event in its asset's series (a spike/ramp/drop), with `detected_at` inside that window and a severity tied to the event's magnitude.
4. **Explanations cite real numbers.** "Risk 82 because Δ +10.4 °C above baseline, persisted 12 observations, Strategic criticality, €1.8B exposure" — generated from the asset's own values.
5. **Deterministic.** A seeded PRNG (no `Date.now()` / `Math.random()`) → byte-identical dataset on every load, so the demo never surprises you on stage.
6. **Plausible domain values.** Coordinates land on the right city/coast; operators, exposures, and temperatures sit in ranges believable for the asset type, region, and season.
7. **Honest Phase 0 texture.** Cloud gaps, lower-confidence passes, and coarse-resolution caveats are *present in the data* — they sell the "public EO is limited; our satellites fix it" narrative instead of hiding it.

## 2. Module layout (`src/lib/data/`)

```
src/lib/data/
  rng.ts          # xmur3 seed → mulberry32 PRNG; gaussian() helper
  constants.ts    # DEMO_NOW, OBSERVATION_DAYS = 90, SEED, status thresholds
  catalog.ts      # hand-authored AssetSeed[] (§5 table) — identity, geo, type,
                  #   criticality, exposure, lens metrics, climate params, scenario
  climate.ts      # regional offset + seasonal model
  scenarios.ts    # scenario → anomaly-shape generators (spike/ramp/drop/flare/plume)
  thermal.ts      # generateObservations(seed) → ThermalObservation[]
  analytics.ts    # calculate* fns (or src/lib/analytics.ts — cross-ref TODO §3)
  alerts.ts       # deriveAlerts(asset, obs) — from the injected events
  risk.ts         # buildRiskAssessment(asset, obs)
  provenance.ts   # EO source catalog + Phase 0 limitations copy
  reports.ts      # generateReport(selection) on demand
  index.ts        # assembles the Dataset once at load; typed selectors
```

`index.ts` builds the dataset once at module load and exposes read-only selectors (`getAssets()`, `getAsset(id)`, `getObservations(id)`, `getAlerts(filter)`, `getRiskAssessment(id)`). No User entity — there is no auth (an optional static display identity only).

## 3. Determinism & time

- `SEED` is a fixed string; `xmur3(SEED)` seeds `mulberry32`. Per-asset streams are seeded by `assetId` so adding/removing one asset doesn't reshuffle the rest.
- `DEMO_NOW` is a fixed ISO date (anchor to **2026-06-12**, the demo date) — *not* `new Date()`. All 90 days count back from it; `last_observation_at` is the last non-cloudy day ≤ `DEMO_NOW` (never a future date).
- `gaussian(mean, sd)` via Box–Muller on the seeded PRNG for noise.

## 4. Entities & realistic ranges

**Asset** — `id`, `name`, `asset_type` (14, below), `country`, `region`, `latitude`, `longitude`, `geometry_geojson?`, `operator` (plausible mock), `criticality` (Low/Medium/High/Strategic), `insurance_exposure_eur`, `baseline_temperature_c`, `current_temperature_c`, `anomaly_score` (0–1), `risk_score` (0–100), `health_score` (0–100), `last_observation_at`, `status`, `tags[]`, `description`. Plus **lens metric fields** (§8): `operational_load_pct`, `capacity_utilization_pct`, `flare_intensity_mw?`, `hazard_proximity_score`.

**ThermalObservation** (90/asset) — `id`, `asset_id`, `timestamp`, `source` (an EO mission, §9), `land_surface_temperature_c`, `brightness_temperature_c`, `baseline_temperature_c`, `thermal_delta_c`, `anomaly_score`, `confidence` (0.4–0.98), `cloud_cover_percent` (0–95), `notes?`.

**Alert** — `id`, `asset_id`, `alert_type` (§7), `severity` (Info/Watch/Warning/Critical), `title`, `description`, `detected_at`, `confidence`, `status` (Open/Acknowledged/Resolved), `suggested_action`.

**RiskAssessment** — `id`, `asset_id`, `timestamp`, `dynamic_risk_score`, `fire_risk_index`, `business_interruption_risk`, `catastrophe_exposure_score`, `thermal_volatility_score`, `inspection_priority_score`, `explanation`.

**Report** — `id`, `report_type`, `asset_id?`, `created_at`, `title`, `summary`, `content_json` — generated on demand from the above.

Score bands (from the brief): `risk_score` → Normal `<30`, Watch `30–55`, Warning `55–75`, Critical `≥75`.

## 5. Asset catalog (44 assets, hand-authored)

Identity/geo/exposure are authored (believable names & places); the time-series and scores are then **generated** from each row's `climate params + scenario`. Coordinates are approximate facility/city locations (~2 dp), refine in `catalog.ts`. Status column = the *intended* scenario (the generator must reproduce it via the analytics).

| ID | Name | Type | Country / Region | Lat | Lon | Criticality | Scenario |
|---|---|---|---|---|---|---|---|
| ES-DSL-LPA-01 | Las Palmas Desalination Plant | Desalination Plant | Spain / Canary Is. | 28.10 | -15.42 | High | Normal |
| AE-DSL-JEA-01 | Jebel Ali Desalination Plant | Desalination Plant | UAE / Dubai | 25.00 | 55.10 | Strategic | **Critical** — cooling-discharge anomaly |
| SA-DSL-JUB-01 | Jubail Desalination Plant | Desalination Plant | Saudi Arabia / Eastern | 27.00 | 49.62 | Strategic | Watch |
| IL-DSL-SOR-01 | Sorek Desalination Plant | Desalination Plant | Israel / Central | 31.94 | 34.74 | High | Normal |
| ES-LNG-BCN-01 | Barcelona LNG Terminal | LNG Terminal | Spain / Catalonia | 41.32 | 2.15 | Strategic | Watch |
| EG-LNG-IDK-01 | Idku LNG Terminal | LNG Terminal | Egypt / Beheira | 31.30 | 30.30 | High | Normal |
| DZ-LNG-SKK-01 | Skikda LNG Terminal | LNG Terminal | Algeria / Skikda | 36.88 | 6.95 | High | Normal |
| DE-LNG-WHV-01 | Wilhelmshaven LNG Terminal | LNG Terminal | Germany / Lower Saxony | 53.61 | 8.13 | High | Watch |
| QA-LNG-RSL-01 | Ras Laffan LNG Terminal | LNG Terminal | Qatar / Al Khor | 25.90 | 51.55 | Strategic | Normal |
| ES-REF-TAR-01 | Tarragona Refinery | Oil Refinery | Spain / Catalonia | 41.10 | 1.18 | Strategic | **Critical** — persistent overheating |
| NL-REF-RTM-01 | Rotterdam Refinery (Pernis) | Oil Refinery | Netherlands / S. Holland | 51.88 | 4.39 | Strategic | Watch |
| ES-REF-BIO-01 | Bilbao Refinery (Petronor) | Oil Refinery | Spain / Basque | 43.32 | -3.05 | High | Normal |
| IT-REF-PRL-01 | Priolo Refinery | Oil Refinery | Italy / Sicily | 37.16 | 15.18 | High | Normal |
| IT-FLR-GEL-01 | Gela Gas Flare Site | Gas Flare Site | Italy / Sicily | 37.07 | 14.23 | Medium | **Warning** — gas-flare increase |
| SA-FLR-GHW-01 | Ghawar Gas Flare Site | Gas Flare Site | Saudi Arabia / Eastern | 25.43 | 49.62 | High | Watch |
| KW-FLR-BRG-01 | Burgan Gas Flare Site | Gas Flare Site | Kuwait / Al Ahmadi | 28.90 | 47.94 | High | Normal |
| IT-PWR-NAP-01 | Naples Power Plant | Power Plant | Italy / Campania | 40.85 | 14.27 | High | Watch |
| ES-PWR-ABN-01 | Aboño Power Plant | Power Plant | Spain / Asturias | 43.56 | -5.76 | Medium | Normal |
| DE-SUB-HAM-01 | Hamburg Power Substation | Electrical Substation | Germany / Hamburg | 53.55 | 9.99 | High | **Warning** — substation overheating |
| DE-SUB-BER-01 | Berlin Power Substation | Electrical Substation | Germany / Berlin | 52.52 | 13.40 | Medium | Normal |
| ES-PLC-MAS-01 | Madrid–Sevilla Power Corridor | Power Line Corridor | Spain / Castilla–La Mancha | 38.99 | -4.10 | High | **Warning** — power-line overheating |
| FR-PLC-PRV-01 | Provence Power Corridor | Power Line Corridor | France / PACA | 43.80 | 5.80 | Medium | Watch |
| DE-DC-FRA-01 | Frankfurt Data Center | Data Center | Germany / Hesse | 50.10 | 8.75 | Strategic | **Warning** — thermal load spike |
| NL-DC-AMS-01 | Amsterdam Data Center | Data Center | Netherlands / N. Holland | 52.30 | 4.94 | High | Watch |
| GB-DC-SLO-01 | Slough Data Center | Data Center | UK / Berkshire | 51.51 | -0.59 | High | Normal |
| ES-PRT-VLC-01 | Valencia Port | Port / Logistics Hub | Spain / Valencia | 39.44 | -0.31 | High | Watch |
| FR-PRT-FOS-01 | Fos-Marseille Industrial Port | Port / Logistics Hub | France / PACA | 43.43 | 4.86 | High | Normal |
| GR-PRT-PIR-01 | Piraeus Port | Port / Logistics Hub | Greece / Attica | 37.94 | 23.64 | High | Normal |
| MA-PRT-TNG-01 | Tanger Med Port | Port / Logistics Hub | Morocco / Tangier | 35.88 | -5.50 | High | Normal |
| BE-WHS-ANT-01 | Antwerp Industrial Zone | Warehouse / Industrial | Belgium / Flanders | 51.24 | 4.40 | High | Watch |
| IT-WHS-MGH-01 | Marghera Industrial Zone | Warehouse / Industrial | Italy / Veneto | 45.47 | 12.22 | Medium | Normal |
| IT-WHS-MIL-01 | Milan Logistics Hub | Warehouse / Industrial | Italy / Lombardy | 45.46 | 9.19 | Medium | Normal |
| ES-URB-MAD-01 | Madrid Urban Heat District | Urban District | Spain / Madrid | 40.42 | -3.70 | High | **Warning** — urban heat stress |
| ES-URB-BCN-02 | Barcelona Urban Heat District | Urban District | Spain / Catalonia | 41.39 | 2.16 | High | Watch |
| IT-URB-ROM-01 | Rome Urban Heat District | Urban District | Italy / Lazio | 41.90 | 12.50 | Medium | Normal |
| FR-URB-PAR-01 | Paris Urban Heat District | Urban District | France / Île-de-France | 48.86 | 2.35 | Medium | Normal |
| GR-WFZ-ATH-01 | Athens Wildfire Risk Zone | Wildfire Risk Zone | Greece / Attica | 38.10 | 23.80 | High | **Critical** — fire hotspot |
| US-WFZ-CAL-01 | California Wildfire Risk Zone | Wildfire Risk Zone | USA / California | 38.50 | -120.50 | High | **Warning** — rising hotspot |
| IT-WFZ-SAR-01 | Sardinia Wildfire Risk Zone | Wildfire Risk Zone | Italy / Sardinia | 40.10 | 9.20 | Medium | Normal |
| MA-SOL-OUA-01 | Ouarzazate Solar Farm (Noor) | Solar Farm | Morocco / Drâa-Tafilalet | 30.99 | -6.86 | High | Normal |
| IL-SOL-ASH-01 | Ashalim Solar Farm | Solar Farm | Israel / Negev | 30.96 | 34.72 | Medium | Normal |
| DZ-PIP-HRM-01 | Hassi R'Mel Pipeline Segment | Pipeline Segment | Algeria / Laghouat | 32.93 | 3.28 | High | Watch |
| TN-PIP-TMD-01 | Trans-Med Pipeline Segment | Pipeline Segment | Tunisia / Mahdia | 35.50 | 10.50 | Medium | Normal |
| MA-PIP-MEG-01 | Maghreb–Europe Pipeline Segment | Pipeline Segment | Morocco / Tangier | 35.90 | -5.40 | Medium | Normal |

**Distribution:** Normal 23 (52%) · Watch 12 (27%) · Warning 6 (14%) · Critical 3 (7%). All 14 asset types covered; every lens (§8) owns ≥1 alerting asset.

## 6. Thermal time-series model

For each asset, for day `d` in `0..89` (date = `DEMO_NOW − (89 − d)`):

```
seasonal(d)    = seasonalAmp * sin(2π · (dayOfYear(date) − phase) / 365)   # gentle warming toward summer
operational(d) = weekdayFactor(date)        # ports/industrial/data-center cycles; 0 for static types
base(d)        = typeBaseline + regionOffset + seasonal(d) + operational(d)
anomaly(d)     = scenarioShape(d)            # 0 for Normal; injected event near the recent end otherwise
lst(d)         = base(d) + anomaly(d) + gaussian(0, noiseSd)
brightness(d)  = lst(d) + typeBrightnessOffset      # large for flares / active fire
cloudy(d)      = rng() < cloudProb           # → high cloud_cover_percent, low confidence, lst may be gap-filled
baseline(d)    = robust median of base over a prior stable window   # the "normal" line on the chart
delta(d)       = lst(d) − baseline(d)
```

Then (via §3 analytics): `anomaly_score = f(|recent delta|, persistence = consecutive days over threshold, volatility = std(delta))`; `risk_score = weighted(anomaly_score, criticality, normalized exposure, thermal_volatility, alert_severity, assetTypeRiskFactor)`; `health_score = 100 − penalty`; `status = classifyStatus(risk_score)`. `current_temperature_c` = last valid `lst`; `baseline_temperature_c` = robust baseline; `confidence ≈ clamp(0.95 − cloud/200, 0.4, 0.98)`.

**Regional climate offset** (June daytime LST tendency, additive °C): Middle East `+12…+18` · North Africa `+8…+14` · South Europe `+3…+8` · West/Central Europe `0…+3` · North Sea/offshore `−3…+2` · California `+5…+12`.

**Scenario shapes** (injected into the recent window so the heartbeat visibly bends): Normal `= 0` (delta ≈ noise) · Watch `= +2…4 °C` step over last ~10–14 d (or raised volatility) · Warning `= ramp to +5…8 °C` over last ~14–21 d · Critical-overheating `= ramp/step to +8…15 °C` sustained ~7–14 d · Critical-spike/hotspot `= +12…25 °C` sharp spike in last few days · Drop/shutdown `= −6…−12 °C` step · Flare-increase `= brightness +150…400 °C` burst · Discharge-anomaly `= plume delta +4…10 °C` vs sea-surface baseline.

## 7. Per-type calibration & anomaly→alert mapping

`typeBaseline` = pre-climate daytime anchor. Fire/BI weights feed the risk indices.

| Asset type | Baseline °C | Behavior | Fire / BI weight | Primary anomaly → alert |
|---|---|---|---|---|
| Oil Refinery | 40–55 | hot, continuous | high / high | persistent overheating |
| LNG Terminal | 20–35 | mixed (cryo + warm process) | med / high | thermal spike; persistent overheating |
| Gas Flare Site | 30–45 (brightness 300–800) | spiky flaring | high / med | gas-flare increase |
| Power Plant | 30–50 | steady, cooling stacks | med / high | persistent overheating |
| Electrical Substation | 25–45 | transformer hotspots | high / med | substation overheating |
| Power Line Corridor | 20–40 | rises with load + ambient | high / med | power-line overheating |
| Data Center | 28–40 | steady, 24/7, high night | med / high | thermal load spike; abnormal night activity |
| Port / Logistics Hub | 25–40 | weekday/weekend activity | med / high | abnormal night activity |
| Warehouse / Industrial | 25–40 | activity cycles | high / med | thermal spike |
| Desalination Plant | 18–32 (SST + discharge) | coastal plume | low / med | cooling-discharge anomaly |
| Urban District | 28–42 | urban heat island | med / med | urban heat stress |
| Wildfire Risk Zone | 30–50 (brightness high) | dry vegetation | high / low | fire hotspot |
| Solar Farm | 40–65 | panels run hot | med / low | underperformance / thermal drop |
| Pipeline Segment | 20–40 | ground temp | high / med | thermal spike (leak/overheat) |

**Alert severity** from the event: `anomaly_score ≥ .75` or status Critical → Critical · `.55–.75` → Warning · `.30–.55` → Watch · else Info. Alert type must be valid for the asset type (no gas-flare alert on a data center). The full alert vocabulary: thermal spike, thermal drop, persistent overheating, fire hotspot, gas-flare increase, cooling-discharge anomaly, power-line overheating, substation overheating, urban heat stress, abnormal night activity, post-disaster damage signal.

## 8. Lens metric fields

Each asset carries the metrics a lens needs to **re-weight marker radius and sort the roster** (the lens re-ramp, see `AGENTS.md`):

| Lens | Radius / sort metric | Asset filter |
|---|---|---|
| Infrastructure Operator (default) | `operational_load_pct` | all critical-infra types |
| Insurer / Underwriter | `insurance_exposure_eur` | all (exposure > 0) |
| Energy & Gas | `flare_intensity_mw` / throughput | refinery, LNG, flare, pipeline |
| Water / Desalination | `capacity_utilization_pct` | desalination |
| Grid Operator | `capacity_utilization_pct` (load) | power plant, substation, line, solar |
| Climate / Civil Protection | `hazard_proximity_score` | wildfire zone, urban district |

`status` and `risk_score` are universal and survive every lens switch (color always flows from `['get','status']`).

## 9. EO source / provenance catalog

Real public missions (approx specs) — cite per observation and on the Data facet / report provenance panel. The demo presents a **near-daily composite** synthesized from these, which justifies the daily cadence *and* the honest Phase 0 limits.

| Source | Thermal resolution | Revisit | Notes |
|---|---|---|---|
| Landsat 8/9 TIRS | ~100 m (delivered 30 m) | ~8 d combined | TIR bands 10/11; multi-day latency |
| Sentinel-3 SLSTR | ~1 km | ~1 d | operational LST product |
| MODIS (Terra/Aqua) | ~1 km | 1–2 /day | MOD11/MYD11 LST |
| VIIRS (S-NPP/NOAA-20) | 375 m / 750 m | ~daily | active-fire detection (hotspots) |
| ECOSTRESS (ISS) | ~70 m | irregular | high-res LST, opportunistic |

**Phase 0 limitations copy (honest):** public EO only; revisit limited and irregular; resolution coarse (mostly ~1 km; best ~70 m) so a single small asset is often a *mixed pixel*; cloud cover causes gaps and lower-confidence passes; cross-sensor thermal calibration varies; no tasking. **Therra dedicated satellites** will improve revisit (daily/sub-daily), resolution (10–30 m), night imaging, radiometric stability, latency (near-real-time), and tasking — the bridge to the satellite-roadmap page.

## 10. Worked example — Tarragona Refinery (`ES-REF-TAR-01`, Critical)

- **Params:** `typeBaseline 45 °C`, S-Europe offset `+5` → base ≈ `50 °C` in June; `noiseSd 1.2`; `cloudProb 0.20`; scenario *critical-overheating* = ramp `+10 °C` sustained over the last 12 days; `exposure €1.8B`, criticality Strategic.
- **Series:** days 0–77 delta ≈ ±2 °C (normal operations); days 78–89 delta ramps `0 → +10.4 °C` and holds.
- **Derived:** `current ≈ 60.4 °C`, `baseline ≈ 50.0 °C`, `Δ +10.4 °C`; `anomaly_score ≈ 0.86` (large magnitude + 12-obs persistence + raised volatility); `risk_score ≈ 82` → **Critical**; `health_score ≈ 24`.
- **Alert:** *Persistent Overheating*, severity Critical, `detected_at` = day 80 (~9 days ago), `confidence 0.83`, `status` Open, action "Dispatch thermal inspection of crude/vacuum units; verify cooling-loop performance."
- **Explanation (generated):** "Risk score 82 (Critical): land-surface temperature is +10.4 °C above the 90-day baseline and has persisted for 12 consecutive observations; asset is Strategic criticality with €1.8B insured exposure and a high refinery type-risk factor. Confidence 0.83 — 2 of the last 14 passes were cloud-affected."

Everything an investor sees on this asset — map color, roster row, heartbeat bend, delta, scores, alert, explanation — traces to the same series.

## 11. QA / validation checklist

- [ ] `status === classifyStatus(risk_score)` for every asset.
- [ ] Every Warning/Critical asset shows a visible anomaly in its last ~21 days **and** a matching alert with `detected_at` in that window.
- [ ] Alert type is valid for the asset type; severity matches `anomaly_score`.
- [ ] No future timestamps; `last_observation_at` = last non-cloudy day ≤ `DEMO_NOW`.
- [ ] Exposures, temperatures, and coordinates within the type/region/season ranges; coords land on the right place.
- [ ] Risk explanation strings contain the asset's actual numbers.
- [ ] Reload twice → identical dataset (determinism).
- [ ] Every lens has ≥1 non-Normal asset; status mix ≈ targets in §5.
- [ ] Each observation carries a real `source`, plausible `cloud_cover_percent`, and consistent `confidence`.
