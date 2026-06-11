# Deployment Guide — Zenway (RailMind Sentinel)

Zenway consists of a Python FastAPI backend and a Vite React frontend.

---

## 1. Local Development Setup

### Backend (Python 3.11+)
1. Navigate to the root directory.
2. Initialize virtual environment:
   `python -m venv venv`
3. Activate virtual environment:
   - Windows: `.\venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
4. Install dependencies:
   `pip install -r backend/requirements.txt`
5. Run server:
   `uvicorn backend.main:app --reload --port 8000`

---

### Frontend (React + TS)
1. Navigate to the `frontend/` directory:
   `cd frontend`
2. Install packages:
   `npm install`
3. Start development server:
   `npm run dev`
4. Open browser at `http://localhost:5173`.

---

## 2. Production Deployment

### Backend on Railway.app
1. Create a new project on Railway.
2. Connect your GitHub repository.
3. Set root directory or specify build command:
   - Root directory: `./`
   - Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Configure variables in the Railway dashboard:
   - `GEMINI_API_KEY` (Optional)
   - `BHASHINI_API_KEY` (Optional)

---

### Frontend on Vercel
1. Create a new project on Vercel.
2. Connect your GitHub repository.
3. Configure the Vite project root directory: `frontend`
4. Configure Build & Development settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Set environment variables:
   - `VITE_API_URL`: URL of your deployed Railway backend (e.g. `https://zenway-backend.up.railway.app`)
