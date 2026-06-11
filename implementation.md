# Implementation Plan — Zenway (RailMind Sentinel)

Zenway is a real-time crowd surge prediction and multilingual alert system for Indian Railways stations, designed to prevent crowd surges and stampedes (inspired by the Feb 2025 NDLS crowd surge). It is built for a 5-day hackathon, focusing on reliability, explainability, human-in-the-loop validation, and extreme visual polish.

---

## User Review Required

> [!IMPORTANT]
> **API Keys & Integrations:**
> We will implement full mock/cached-response modes for Gemini 1.5 Flash and Bhashini so that the application is 100% reliable without active API credentials. In live mode, it will use environment variables (`GEMINI_API_KEY`, `BHASHINI_API_KEY`).
> 
> **Judge Demo Mode Timeline:**
> The demo mode compresses a 2-hour timeline into 60 seconds. The frontend will drive this timeline by tracking elapsed seconds (0-60s) and sending it as a query parameter (`elapsed=X`) or the backend will fallback to a time-based modulo tracking. This ensures stateless reliability and easy reloading.

---

## Proposed Changes

### Component 1: Shared Models & Event Bus
We will establish TypeScript interfaces and Python Pydantic models for domain entities to ensure absolute contract symmetry. We will also implement a simple in-process event bus.

#### [NEW] [models/surge.py](file:///c:/Users/Sibam%20Prasad%20Sahoo/Desktop/Zenway/backend/models/surge.py)
- Pydantic models for `CrowdRiskAssessment`, `Platform`, `Station`.

#### [NEW] [models/train.py](file:///c:/Users/Sibam%20Prasad%20Sahoo/Desktop/Zenway/backend/models/train.py)
- Pydantic models for `Train` and `DelayEvent`.

#### [NEW] [models/alert.py](file:///c:/Users/Sibam%20Prasad%20Sahoo/Desktop/Zenway/backend/models/alert.py)
- Pydantic models for `Alert`, `Announcement`, `ActionCard`, `AgentRun`.

#### [NEW] [models/audit_log.py](file:///c:/Users/Sibam%20Prasad%20Sahoo/Desktop/Zenway/backend/models/audit_log.py)
- Pydantic model for `AuditLog`.

#### [NEW] [events/event_types.py](file:///c:/Users/Sibam%20Prasad%20Sahoo/Desktop/Zenway/backend/events/event_types.py)
- Enums and payload schemas for all core system events (`TRAIN_DELAY_DETECTED`, `SURGE_RISK_UPDATED`, etc.).

#### [NEW] [events/bus.py](file:///c:/Users/Sibam%20Prasad%20Sahoo/Desktop/Zenway/events/bus.py)
- In-process event bus with `register(event_type, callback)` and `emit(event_type, payload)` methods.

---

### Component 2: Backend Logic & APIs
The backend will manage the logic of calculating surge scores, fetching/generating train data, running the LangGraph agent for alerts, and serving API endpoints via FastAPI.

#### [NEW] [surge.py](file:///c:/Users/Sibam%20Prasad%20Sahoo/Desktop/Zenway/backend/surge.py)
- Pure math surge score prediction logic using the formula:
  `expected_passengers_from_delayed_trains = delayed_trains_arriving_in_30min * avg_passengers_per_train`
  `score = min(100, (expected_passengers_from_delayed_trains / platform_capacity) * 100)`
- Emits `SURGE_RISK_UPDATED` with `contributing_factors`.
- Emits `SURGE_RISK_CRITICAL` when score >= 76.

#### [NEW] [apis/railway_api.py](file:///c:/Users/Sibam%20Prasad%20Sahoo/Desktop/Zenway/backend/apis/railway_api.py)
- Client wrapper for `indianrailapi.com` / `NTES`.
- Implements `mock_mode` and `demo_mode` scenarios: `normal`, `elevated`, and `critical` driven by compressed time.

#### [NEW] [agent.py](file:///c:/Users/Sibam%20Prasad%20Sahoo/Desktop/Zenway/backend/agent.py)
- LangGraph pipeline that coordinates the creation of `ActionCard` (Gemini) and translating it (Bhashini).
- Falls back to `cached_api_responses.json` in demo mode.

#### [NEW] [main.py](file:///c:/Users/Sibam%20Prasad%20Sahoo/Desktop/Zenway/backend/main.py)
- FastAPI app exposing endpoints: `/surge-score`, `/surge-score/all`, `/trains/incoming`, `/alert/generate`, `/alert/announce`, `/alert/confirm`, `/events/history`, and SSE/polling for events.

---

### Component 3: Demo Scenarios & Data Files
We will pre-package seed data and mock responses.

#### [NEW] [data/stations.json](file:///c:/Users/Sibam%20Prasad%20Sahoo/Desktop/Zenway/backend/data/stations.json)
- Station layouts for Howrah (HWH), New Delhi (NDLS), CSMT Mumbai.

#### [NEW] [data/howrah_seed_trains.json](file:///c:/Users/Sibam%20Prasad%20Sahoo/Desktop/Zenway/backend/data/howrah_seed_trains.json)
- 10 realistic trains for live-fallback mode.

#### [NEW] [data/cached_api_responses.json](file:///c:/Users/Sibam%20Prasad%20Sahoo/Desktop/Zenway/backend/data/cached_api_responses.json)
- Cached Gemini action cards and Bhashini 5-language translations for normal/elevated/critical scenarios.

---

### Component 4: Frontend Command Center
We will build a React dashboard inside `frontend/` with a high-fidelity "dark ops" aesthetic, Grafana-like panels, and an interactive demo control panel.

#### [NEW] [src/types/](file:///c:/Users/Sibam%20Prasad%20Sahoo/Desktop/Zenway/frontend/src/types)
- Mirroring Pydantic models in TypeScript.

#### [NEW] [src/components/RiskGauge.tsx](file:///c:/Users/Sibam%20Prasad%20Sahoo/Desktop/Zenway/frontend/src/components/RiskGauge.tsx)
- Large color-coded animated SVG circular gauge showing risk level and expanding into formula explanations on click.

#### [NEW] [src/components/PAPanel.tsx](file:///c:/Users/Sibam%20Prasad%20Sahoo/Desktop/Zenway/frontend/src/components/PAPanel.tsx)
- Multi-lingual announcement cards for the 5 selected Indian languages.

#### [NEW] [src/pages/Dashboard.tsx](file:///c:/Users/Sibam%20Prasad%20Sahoo/Desktop/Zenway/frontend/src/pages/Dashboard.tsx)
- Unified grid containing RiskGauges, Train Feed, Platform Grid, Active Alert Card (with Operator confirmation button), PA Panel, and the live AuditLog.

---

## Verification Plan

### Automated Tests
- Running `pytest` on backend tests to verify logic:
  `pytest backend/tests/`

### Manual Verification
- Launch backend on `localhost:8000` and frontend on `localhost:5173`.
- Open browser at `http://localhost:5173/?demo=true&scenario=critical`.
- Verify the compressed timeline plays out, the risk score climbs, an alert is triggered, and clicking "Confirm Broadcast" logs to the AuditLog and resolves the active card.
