# Zenway — RailMind Sentinel

Zenway is a real-time crowd surge prediction and multilingual alert system for Indian Railways stations, designed to prevent crowd surges and stampedes before they build (inspired by the New Delhi Platform 1 crowd surge stampede in Feb 2025).

---

## 🚀 Key Features

1. **Crowd Surge Predictor (Feature 1):** Pure math predictive scoring algorithm that processes physical platform capacities, standard station base loads, and incoming delayed train passengers to forecast congestion 30 minutes in advance. Fully explainable with audit steps.
2. **Multimodal Mitigation Engine (Feature 2):** A LangGraph agent pipeline triggered automatically on Critical risk levels (76%+). It queries Gemini 1.5 Flash to synthesize specific dispatch suggestions and Bhashini to translate the safety announcement script.
3. **Command Center Dashboard (Feature 3):** React TypeScript dashboard with a dark ops theme, real-time gauges, incoming trains monitor, physical platform occupancy grid, active warning panels, and multilingual PA text-to-speech voice playbacks.
4. **Judge Demo Mode:** 100% deterministic, offline-capable timeline simulation that compresses 2 hours of compound delays into 60 seconds.

---

## 🛠️ Tech Stack

- **Backend:** Python 3.11/3.13, FastAPI, LangGraph, Pydantic, HTTPX, PyTest
- **Frontend:** React 18, TypeScript, Tailwind CSS v4, Lucide Icons
- **APIs:** Gemini 1.5 Flash, Bhashini Translations

---

## 📦 Getting Started

### 1. Backend Server
```bash
# Set up virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install requirements
pip install -r backend/requirements.txt

# Start backend server (runs on localhost:8000)
uvicorn backend.main:app --reload --port 8000
```

### 2. Frontend Command Center
```bash
cd frontend

# Install packages
npm install

# Start Vite server (runs on localhost:5173)
npm run dev
```

---

## 🧪 Running Tests
To verify the surge score calculation logic and event handlers:
```bash
.\venv\Scripts\python -m pytest backend/tests/
```

---

## 📖 Project Documentation
- **Architecture & System Design:** [`docs/architecture.md`](file:///c:/Users/Sibam%20Prasad%20Sahoo/Desktop/Zenway/docs/architecture.md)
- **API Endpoints Reference:** [`docs/api-reference.md`](file:///c:/Users/Sibam%20Prasad%20Sahoo/Desktop/Zenway/docs/api-reference.md)
- **Judging Walkthrough Story:** [`docs/judging-story.md`](file:///c:/Users/Sibam%20Prasad%20Sahoo/Desktop/Zenway/docs/judging-story.md)
- **Interactive Scenarios Script:** [`docs/demo-script.md`](file:///c:/Users/Sibam%20Prasad%20Sahoo/Desktop/Zenway/docs/demo-script.md)
- **Executive Pitch Summary:** [`docs/executive_summary.md`](file:///c:/Users/Sibam%20Prasad%20Sahoo/Desktop/Zenway/pitch/executive_summary.md)
