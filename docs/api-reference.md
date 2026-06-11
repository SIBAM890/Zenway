# API Reference — Zenway (RailMind Sentinel)

The Zenway backend is built with FastAPI and runs on `http://localhost:8000`.

---

## 1. Risk Assessment & Telemetry

### `GET /surge-score`
Fetches the current `CrowdRiskAssessment` for a specific platform.
- **Parameters:**
  - `station` (string, required): Station code (e.g. `NDLS`, `HWH`)
  - `platform` (string, required): Platform ID (e.g. `P1`, `P2`)
  - `demo` (boolean, optional): Set `true` to activate Judge Demo Mode
  - `scenario` (string, optional): Scenario type (`normal`, `elevated`, `critical`)
  - `elapsed` (integer, optional): Scrubber seconds index (0 to 60)

---

### `GET /surge-score/all`
Fetches `CrowdRiskAssessment` array for all platforms at a station. Same parameters as `/surge-score`.

---

### `GET /trains/incoming`
Fetches incoming train schedules, delays, and expected loads. Same parameters as `/surge-score`.

---

## 2. Alert & Announcement Operations

### `POST /alert/generate`
Manually triggers the Feature 2 pipeline (ActionCard creation).
- **Request Body:**
  ```json
  {
    "station_id": "NDLS",
    "platform_id": "P1",
    "score": 91.0,
    "contributing_factors": {
      "platform_capacity": 2000,
      "typical_load": 500,
      "expected_passengers_from_delayed_trains": 1320,
      "delayed_trains_count": 3
    },
    "demo": true,
    "scenario": "critical"
  }
  ```

---

### `POST /alert/announce`
Manually translates the alert summary into regional languages.
- **Request Body:**
  ```json
  {
    "alert_id": "A-F3A1",
    "summary": "Critical crowd surge alert on Platform 1...",
    "demo": true,
    "scenario": "critical"
  }
  ```

---

### `POST /alert/confirm`
Confirms the pending alert, changing its status to `"broadcasted"`. Triggers `ALERT_CONFIRMED` and `ALERT_BROADCASTED` events.
- **Request Body:**
  ```json
  {
    "alert_id": "A-F3A1"
  }
  ```

---

## 3. Events & Audit Log

### `GET /events/history`
Returns an array of logged events.
- **Parameters:**
  - `station` (string, optional): Filter by station code

---

### `GET /events/stream`
Server-Sent Events (SSE) endpoint providing live telemetry updates.
- **Response Format:**
  `data: {"event_type": "SURGE_RISK_CRITICAL", "timestamp": "...", "data": {...}}`

---

## 4. Scenario Controller

### `POST /demo/reset`
Resets the timer cache and logs for a specific scenario to allow clean restarts.
- **Parameters:**
  - `scenario` (string, required): `normal`, `elevated`, or `critical`
  - `station` (string, optional): Station code
