You are an expert full-stack software engineer, geospatial data engineer, Earth Observation analyst, and product designer.

Build a complete MVP web platform for a fictional startup called Therra Space.

Therra Space’s mission is:

“Measure the pulse of civilization.”

The platform must transform public thermal and Earth Observation data into actionable intelligence for:

    Critical infrastructure monitoring
    Insurance risk assessment
    Urban heat, wildfire, gas flare, desalination, power grid, and industrial anomaly monitoring

The product name is:

Therra Intelligence Platform

Abbreviation:

TIP

Tagline:

Measure the pulse of civilization.

The MVP must look and feel like a serious B2B geospatial intelligence platform for investors, insurers, infrastructure operators, governments, and energy companies.

Do not build a toy demo. Build a clean, realistic, scalable MVP with mock data where real external data integrations are not immediately available.

The platform must be fully runnable locally.

Use the following stack unless there is a strong reason not to:

Frontend:

    React
    TypeScript
    Vite
    Tailwind CSS
    Mapbox GL JS or Leaflet
    Recharts for charts
    Lucide React for icons

Backend:

    Python
    FastAPI
    Pydantic
    SQLAlchemy
    PostgreSQL/PostGIS preferred
    If database setup is too heavy, provide a SQLite fallback with clear abstraction

Data processing:

    Python
    Pandas
    GeoPandas if needed
    Rasterio optional
    NumPy
    Mock EO data generators for Phase 0

Authentication:

    Simple mock authentication for MVP
    User roles: Admin, Analyst, Client

Deployment:

    Docker Compose
    Separate frontend and backend services
    Seed database script
    Clear README with setup instructions

The final output must include:

    Complete project structure
    All source files
    README
    Backend API
    Frontend dashboard
    Mock database seed
    Example assets
    Example thermal observations
    Example alerts
    Example insurance scores
    Example anomaly detection outputs

The app must run with:

docker compose up

or with clear local commands
==================================================

 PRODUCT REQUIREMENTS

The platform must allow a user to monitor a portfolio of assets and regions using thermal intelligence.

The core concept is:

Every monitored object has a Thermal Heartbeat.

A Thermal Heartbeat is a time series showing the object’s normal and abnormal thermal behavior.

The platform must show:

    Current thermal status
    Historical thermal trends
    Thermal anomaly alerts
    Dynamic risk score
    Infrastructure health score
    Insurance risk indicators
    Urban heat vulnerability
    Wildfire risk and active hotspot indicators
    Gas flare intensity indicators
    Desalination plant thermal discharge monitoring
    Power line overheating risk
    Data center thermal load
    Refinery and LNG terminal activity
    Ports and industrial zones activity
    Asset-level and portfolio-level summaries

The MVP must support the following monitored asset types:

    Desalination Plant
    LNG Terminal
    Oil Refinery
    Gas Flare Site
    Power Plant
    Electrical Substation
    Power Line Corridor
    Data Center
    Port / Logistics Hub
    Warehouse / Industrial Facility
    Urban District
    Wildfire Risk Zone
    Solar Farm
    Pipeline Segment

Each asset must have:

    ID
    Name
    Type
    Country
    Region
    Latitude
    Longitude
    Geometry if relevant
    Owner/operator mock field
    Criticality level: Low, Medium, High, Strategic
    Insurance exposure value
    Baseline thermal value
    Current thermal value
    Thermal anomaly score
    Risk score
    Infrastructure health score
    Last observation timestamp
    Status: Normal, Watch, Warning, Critical
    Tags
    Short description

==================================================
 MAIN USER FLOWS

    Login
    User opens the platform and logs in with mock credentials.
    Portfolio overview
    User sees all monitored assets on a map and in a table.
    Asset filtering
    User can filter by:

    Asset type
    Status
    Risk score
    Region
    Criticality
    Insurance exposure
    Anomaly type

    Asset detail
    User clicks one asset and sees:

    Map location
    Current status
    Thermal Heartbeat chart
    Historical observations
    Baseline comparison
    Thermal delta
    Anomaly explanation
    Risk score explanation
    Insurance implications
    Recommended action

    Alerts
    User sees active alerts:

    Thermal spike
    Thermal drop
    Persistent overheating
    Fire hotspot
    Gas flare increase
    Cooling discharge anomaly
    Power line overheating
    Urban heat stress
    Abnormal night activity
    Post-disaster damage signal

    Insurance dashboard
    User sees:

    Portfolio risk exposure
    Highest-risk assets
    Total insured value at risk
    Risk score distribution
    Recent risk changes
    Suggested underwriting action

    Critical infrastructure dashboard
    User sees:

    Operational activity indicators
    Infrastructure health score
    Assets with degraded thermal behavior
    Assets requiring inspection
    Strategic sites with abnormal activity

    Urban heat and climate dashboard
    User sees:

    Urban heat zones
    vulnerable districts
    heat intensity score
    recommendations for mitigation

    Reports
    User can generate a mock report for an asset or portfolio:

    PDF export can be mocked if needed
    At minimum create a report view with a print-friendly layout

==================================================
 PAGE STRUCTURE

Build the following frontend pages:

    Login Page

    Therra Space branding
    Mission line: “Measure the pulse of civilization.”
    Mock login
    Demo credentials shown subtly

    Main Dashboard
    Components:

    Top navigation bar
    Sidebar
    KPI cards
    Map
    Asset table
    Recent alerts
    Risk distribution chart

KPI cards:

    Total monitored assets
    Critical alerts
    Average portfolio risk
    Total insured exposure
    Assets in abnormal thermal state
    Wildfire hotspots
    Gas flare anomalies
    Power grid warnings

    Map View
    Interactive geospatial map showing assets.

Markers must be color coded:

    Green: Normal
    Yellow: Watch
    Orange: Warning
    Red: Critical

Markers must use different icons by asset type.

Clicking marker opens popup:

    Asset name
    Type
    Status
    Risk score
    Thermal anomaly score
    Button to asset detail

    Asset Detail Page
    Sections:

    Header with asset name, type, status, criticality
    Asset summary cards
    Thermal Heartbeat chart
    Thermal baseline comparison chart
    Risk score breakdown
    Recent observations table
    Alerts for this asset
    Recommended action panel
    Insurance implications panel
    Infrastructure operations panel
    Data provenance panel

    Alerts Page
    Table of alerts:

    Alert ID
    Asset
    Alert type
    Severity
    Detected time
    Confidence
    Suggested action
    Status: Open, Acknowledged, Resolved

Allow filtering by severity, type, status, asset type.

    Insurance Risk Dashboard
    Must include:

    Total insured exposure
    Exposure at critical risk
    Top 10 highest-risk assets
    Portfolio risk over time
    Risk by asset type
    Recommended underwriting actions

Insurance metrics:

    Dynamic Risk Score
    Fire Risk Index
    Business Interruption Risk
    Catastrophe Exposure
    Thermal Volatility
    Inspection Priority

    Critical Infrastructure Dashboard
    Must include:

    Infrastructure Health Index
    Operational Activity Index
    Assets requiring inspection
    Thermal anomaly map
    Activity changes over time

Relevant metrics:

    Overheating probability
    Underperformance signal
    Operational intensity
    Night activity index
    Thermal stability index

    Wildfire and Climate Dashboard
    Must include:

    Active thermal hotspots
    Wildfire risk zones
    Urban heat island intensity
    Heat vulnerability score
    Recent hotspot trend

    Gas Flares Dashboard
    Must include:

    Gas flare locations
    Flare intensity trend
    Abnormal flare increase alerts
    Estimated operational activity change
    Environmental risk indication

    Desalination Monitoring Dashboard
    Must include:

    Desalination plant thermal discharge map
    Cooling plume anomaly score
    Operational intensity estimate
    Coastal thermal impact indicator
    Plant health status

    Power Grid Dashboard
    Must include:

    Power line corridor monitoring
    Substation overheating
    Grid asset risk ranking
    Thermal corridor anomalies
    Inspection priority

    Reports Page
    Allow user to select:

    Asset
    Date range
    Report type:


        Infrastructure Health Report
        Insurance Risk Report
        Thermal Anomaly Report
        Urban Heat Report
        Wildfire Risk Report
        Gas Flare Activity Report
        Desalination Thermal Discharge Report

Generate an on-screen report with:

    Executive summary
    Main findings
    Charts
    Map snapshot placeholder
    Recommended actions
    Data confidence
    Limitations

==================================================
 DATA MODEL

Create backend models for:

User:

    id
    name
    email
    role

Asset:

    id
    name
    asset_type
    country
    region
    latitude
    longitude
    geometry_geojson nullable
    operator
    criticality
    insurance_exposure_eur
    baseline_temperature_c
    current_temperature_c
    anomaly_score
    risk_score
    health_score
    last_observation_at
    status
    tags
    description

ThermalObservation:

    id
    asset_id
    timestamp
    source
    land_surface_temperature_c
    brightness_temperature_c
    baseline_temperature_c
    thermal_delta_c
    anomaly_score
    confidence
    cloud_cover_percent
    notes

Alert:

    id
    asset_id
    alert_type
    severity
    title
    description
    detected_at
    confidence
    status
    suggested_action

RiskAssessment:

    id
    asset_id
    timestamp
    dynamic_risk_score
    fire_risk_index
    business_interruption_risk
    catastrophe_exposure_score
    thermal_volatility_score
    inspection_priority_score
    explanation

Report:

    id
    report_type
    asset_id nullable
    created_at
    title
    summary
    content_json

==================================================
 BACKEND API REQUIREMENTS

Create FastAPI endpoints:

Auth:
POST /api/auth/login

Assets:
GET /api/assets
GET /api/assets/{asset_id}
GET /api/assets/{asset_id}/observations
GET /api/assets/{asset_id}/alerts
GET /api/assets/{asset_id}/risk

Dashboard:
GET /api/dashboard/summary
GET /api/dashboard/risk-distribution
GET /api/dashboard/thermal-trends

Alerts:
GET /api/alerts
PATCH /api/alerts/{alert_id}

Insurance:
GET /api/insurance/summary
GET /api/insurance/top-risk-assets
GET /api/insurance/exposure-by-risk
GET /api/insurance/risk-timeseries

Critical Infrastructure:
GET /api/infrastructure/summary
GET /api/infrastructure/health-ranking
GET /api/infrastructure/activity-index

Wildfire:
GET /api/wildfire/summary
GET /api/wildfire/hotspots

Gas Flares:
GET /api/gas-flares/summary
GET /api/gas-flares/assets

Desalination:
GET /api/desalination/summary
GET /api/desalination/assets

Power Grid:
GET /api/power-grid/summary
GET /api/power-grid/assets

Reports:
POST /api/reports/generate
GET /api/reports
GET /api/reports/{report_id}

All endpoints must return realistic mock or seeded data
==================================================

 ANALYTICS LOGIC

Implement simple but explainable analytics.

Do not use black-box AI for the MVP.

For each asset:

Thermal Delta:
current_temperature_c - baseline_temperature_c

Anomaly Score:
Based on absolute thermal delta, persistence, and volatility.

Risk Score:
Weighted combination of:

    anomaly score
    asset criticality
    insurance exposure
    thermal volatility
    alert severity
    asset type risk factor

Health Score:
100 - normalized risk/anomaly penalty

Status:

    Normal: risk_score < 30
    Watch: 30 <= risk_score < 55
    Warning: 55 <= risk_score < 75
    Critical: risk_score >= 75

Fire Risk Index:
Higher for warehouses, refineries, substations, power lines, wildfire zones, data centers.

Business Interruption Risk:
Higher for ports, LNG terminals, refineries, data centers, power plants.

Gas Flare Activity:
Detect increased flare intensity relative to baseline.

Desalination Thermal Discharge:
Detect abnormal coastal thermal plume or high discharge temperature.

Power Line Risk:
Detect elevated corridor temperature and persistent anomalies.

Urban Heat Vulnerability:
Weighted combination of:

    land surface temperature
    historical heat intensity
    criticality
    mock vulnerability score

Include functions in backend like:

calculate_anomaly_score()
calculate_risk_score()
calculate_health_score()
classify_status()
calculate_fire_risk_index()
calculate_business_interruption_risk()
calculate_thermal_volatility()
generate_asset_recommendations()

Each asset detail page must show not only the score but also why the score was assigned.

Example:

“Risk score is high because thermal delta is +8.4°C above baseline, anomaly has persisted for 5 observations, and the asset is classified as Strategic criticality with €420M insured exposure.”
==================================================

 SEED DATA REQUIREMENTS

Create at least 40 realistic assets across Europe, North Africa, Middle East, and global industrial regions.

Include examples such as:

    Barcelona LNG Terminal
    Tarragona Refinery
    Valencia Port
    Marseille Industrial Port
    Rotterdam Refinery
    Frankfurt Data Center
    Hamburg Power Substation
    Sicily Gas Flare Site
    Canary Islands Desalination Plant
    Dubai Desalination Plant
    Saudi Gas Flare Site
    North Sea Offshore Platform
    Madrid Urban Heat District
    Barcelona Urban Heat District
    Athens Wildfire Risk Zone
    California Wildfire Risk Zone
    Morocco Solar Farm
    Algeria Pipeline Segment
    Egypt LNG Terminal
    Antwerp Industrial Zone

For each asset, generate:

    90 days of thermal observations
    baseline and current temperature
    random but plausible anomalies
    at least one alert for high-risk assets
    risk assessment

Make the data feel believable.

Add some normal assets, some watch assets, some warning assets, and some critical assets
==================================================

 FRONTEND DESIGN REQUIREMENTS

The UI must feel premium, serious, and space/defense/intelligence oriented.

Visual style:

    Dark theme by default
    Clean typography
    High contrast
    Professional dashboard cards
    Minimal but elegant
    Avoid childish colors
    Use subtle gradients
    Use clear status colors

Brand:

    Company name: Therra Space
    Product name: Therra Intelligence Platform
    Tagline: Measure the pulse of civilization
    Use thermal/earth/space visual language

Navigation sidebar:

    Dashboard
    Map
    Assets
    Alerts
    Insurance
    Critical Infrastructure
    Wildfire & Climate
    Gas Flares
    Desalination
    Power Grid
    Reports
    Settings

Reusable components:

    StatusBadge
    RiskScoreCard
    AssetTypeIcon
    ThermalHeartbeatChart
    AssetMap
    KPIGrid
    AlertTable
    AssetTable
    ReportPreview
    FilterPanel

==================================================
 REPORTING REQUIREMENTS

Reports must be investor-demo ready.

Example report:

Title:
Thermal Intelligence Report — Barcelona LNG Terminal

Sections:

    Executive Summary
    Current Thermal Status
    Thermal Heartbeat
    Anomaly Detection
    Risk Interpretation
    Insurance Implications
    Infrastructure Operations Implications
    Recommended Actions
    Data Sources
    Confidence and Limitations

Limitations section must be honest:

    Phase 0 uses public EO datasets
    Revisit is limited
    Resolution is limited
    Cloud cover may affect observations
    Proprietary satellites will improve revisit, resolution, latency, and tasking

This is crucial because the platform narrative must connect to the future satellite constellation
==================================================

 FUTURE SATELLITE ROADMAP SECTION

Add a page or section called:

“Why Therra Satellites?”

This must explain why public missions are useful for Phase 0 but insufficient for the final business.

Include comparison table:

Public EO Phase 0:

    Low cost
    Historical archive
    Useful for validation
    Limited revisit
    Limited resolution
    Limited tasking
    Limited latency

Therra Dedicated Satellites:

    Higher revisit
    Higher resolution
    Taskable
    Near-real-time alerts
    Optimized for infrastructure
    Consistent thermal baselines
    Customer-specific monitoring

Core satellite requirements:

    10–30 m thermal resolution target
    Daily to sub-daily revisit
    Night imaging
    Radiometric stability
    Near-real-time delivery
    Onboard anomaly detection in future
    Infrastructure-focused tasking

==================================================
 README REQUIREMENTS

Write a complete README including:

    Project description
    Product vision
    Architecture
    Tech stack
    How to run locally
    Demo login credentials
    API endpoints
    Seed data explanation
    MVP limitations
    Future roadmap
    Screenshots placeholders
    How the platform supports Phase 0 investor validation

==================================================
 QUALITY REQUIREMENTS

Code must be:

    Clean
    Modular
    Typed where possible
    Easy to extend
    Well organized
    Runnable
    Not over-engineered
    Clear enough for a startup MVP

Frontend must:

    Compile successfully
    Have no broken imports
    Use reusable components
    Have responsive layout
    Handle loading and error states

Backend must:

    Start successfully
    Provide working API docs at /docs
    Seed database with demo data
    Return realistic responses

Do not leave TODOs for core MVP features.

If something must be mocked, mock it cleanly and label it as Phase 0 mock
==================================================

 DELIVERABLE

Create the full repository.

After implementation, provide:

    Summary of what was built
    How to run it
    Demo credentials
    Key pages implemented
    Main API endpoints
    Known limitations
    Suggested next development steps

Important:

This is not a generic dashboard.

This is a thermal intelligence platform for critical infrastructure and insurance.

The core story must be visible everywhere:

Every critical asset has a thermal heartbeat.

Therra Space measures it.
