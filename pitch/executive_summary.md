# Executive Summary — Zenway (RailMind Sentinel)

## 1. The Core Problem
India’s railway stations handle over 22 million passengers daily. When train delays compound during festival seasons, platforms rapidly exceed capacity, resulting in tragic crowd surge stampedes (such as the New Delhi stampede in Feb 2025). The root causes are:
- **No Early Warning Telemetry:** Systems trigger only *after* overcrowding is visual or dangerous.
- **No Translation Pipeline:** Station announcements are slow, single-language, or delayed, creating panic or confusion.
- **No Action Protocol:** Station Masters are overloaded and lack real-time mitigation instructions.

---

## 2. The Zenway Solution
Zenway is a real-time crowd surge prediction and multilingual alert dashboard that gives Station Masters the power to preemptively manage crowds:
1. **Surge Prediction Calculator:** An explainable, pure mathematical algorithm that integrates physical platform capacities, standard off-peak loads, and NTES incoming delayed train passengers to predict surges 30 minutes in advance.
2. **AI-Enabled Operator Dispatch:** A LangGraph pipeline that coordinates Gemini 1.5 Flash to automatically output 5 specific safety dispatch actions when risk levels turn critical.
3. **5-Language PA Broadcaster:** Integrated Bhashini API scripts translate safety announcements into Hindi, Tamil, Telugu, Odia, and Bengali, including browser speech-synthesis readouts.
4. **Human In Control Gate:** Direct operator confirm requirements prevent accidental broadcasts.

---

## 3. Tech Stack & Competitive Edge
- **Backend:** Python 3.11, FastAPI, LangGraph, httpx.
- **Frontend:** React 18, TypeScript, Tailwind CSS v4, Lucide.
- **Edge:** 100% deterministic Judge Demo Mode replaying pre-compiled scenarios without internet dependency, demonstrating bulletproof reliability during evaluation.
