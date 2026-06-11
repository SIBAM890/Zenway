# The Judging Story — Zenway (RailMind Sentinel)

## The Trigger: New Delhi, February 2025
In February 2025, a crowd surge on Platform 1 of the New Delhi Railway Station (NDLS) resulted in a tragic stampede, killing 18 passengers and injuring dozens. The crowd had been building continuously for over 2 hours due to compounding delays of three high-capacity trains bound for Uttar Pradesh and Bihar. 

The station master was unaware of the building risk until the platforms were already over-capacity. There was no real-time telemetry, no predictive algorithm, and no automated alert protocol.

---

## The Solution: Zenway
Zenway is built to solve this exact bottleneck by introducing:
1. **Mathematical Pre-empting:** Rather than waiting for crowd sensors to trigger after a platform is full, Zenway looks at scheduled vs actual train timelines and passenger averages to predict occupancy 30 minutes in advance.
2. **AI Action Recommendations:** When risk is Critical (76%+), a LangGraph safety agent runs, requesting Gemini 1.5 Flash to synthesize specific dispatch directions.
3. **Multilingual PA Broadcaster:** Safe, orderly, non-panic inducing PA announcement scripts are generated in 5 local languages (Hindi, Tamil, Telugu, Odia, Bengali) via Bhashini and broadcasted immediately to passengers.
4. **Human In Control Gate:** Station masters review the AI suggestions and click a single confirmation button before RPF is dispatched and the PA system goes live.

This combination of pure math prediction, generative AI recommendations, and strict human-in-the-loop oversight guarantees safety and deployment reliability.
