"""
prompt_config.py
----------------
RailMind Sentinel — Multimodal Alert Engine
Prompt configuration and Gemini API integration for action card generation.
 
Owner : Supriya (LLM Prompt Engineering)
Team  : Zenway · Sri Sri University
Event : FAR AWAY 2026 · Railways Theme
"""
 
import json
import os
import re
import logging
from typing import Optional
import google.generativeai as genai
 
# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
 
logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(name)s | %(message)s")
logger = logging.getLogger("railmind.prompt_config")
 
# ---------------------------------------------------------------------------
# Gemini client setup
# ---------------------------------------------------------------------------
 
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
 
MODEL_NAME = "gemini-1.5-flash"          # Free tier — do not change for Round 1
TEMPERATURE = 0.3                         # Low = consistent, structured outputs
MAX_OUTPUT_TOKENS = 512                   # Action cards are short; cap tokens
 
# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------
 
SYSTEM_PROMPT = """You are RailMind Sentinel, a railway station safety AI deployed by Indian Railways.
 
Your job: When crowd surge risk reaches Critical level, generate a concise, actionable station master action card.
 
RULES:
- Be specific. Name gates, platforms, and bay numbers wherever possible.
- Be direct. No filler words, no generic advice.
- Time window must be realistic (derived from the time_to_critical value in the input).
- Confidence score must reflect actual uncertainty — do not always return 1.0.
- Actions must be exactly 5 items. Each must be a concrete, executable instruction.
- Never use "consider" or "might" — issue direct orders.
 
OUTPUT FORMAT — return ONLY valid JSON, no explanation, no markdown fences:
{
  "summary": "<one sentence describing the situation>",
  "actions": [
    "<Action 1>",
    "<Action 2>",
    "<Action 3>",
    "<Action 4>",
    "<Action 5>"
  ],
  "time_window": "You have ~<X> minutes before critical overcrowding.",
  "confidence": <float between 0.0 and 1.0>
}"""
 
# ---------------------------------------------------------------------------
# Input schema (mirrors Sibam's /alert/generate POST body)
# ---------------------------------------------------------------------------
 
def build_user_message(
    station: str,
    platform: str,
    risk_score: int,
    delayed_trains: int,
    expected_passengers: int,
    platform_capacity: int,
    time_to_critical: int,
) -> str:
    """Serialize surge context into the JSON string Gemini receives as user input."""
    payload = {
        "station": station,
        "platform": platform,
        "risk_score": risk_score,
        "delayed_trains": delayed_trains,
        "expected_passengers": expected_passengers,
        "platform_capacity": platform_capacity,
        "time_to_critical": time_to_critical,
    }
    return json.dumps(payload)
 
# ---------------------------------------------------------------------------
# Action card generation
# ---------------------------------------------------------------------------
 
def generate_action_card(
    station: str,
    platform: str,
    risk_score: int,
    delayed_trains: int,
    expected_passengers: int,
    platform_capacity: int,
    time_to_critical: int,
) -> Optional[dict]:
    """
    Call Gemini and return a validated action card dict, or None on failure.
 
    Returns:
        {
            "summary": str,
            "actions": list[str],   # always 5 items
            "time_window": str,
            "confidence": float
        }
    """
    user_message = build_user_message(
        station=station,
        platform=platform,
        risk_score=risk_score,
        delayed_trains=delayed_trains,
        expected_passengers=expected_passengers,
        platform_capacity=platform_capacity,
        time_to_critical=time_to_critical,
    )
 
    model = genai.GenerativeModel(
        model_name=MODEL_NAME,
        system_instruction=SYSTEM_PROMPT,
        generation_config=genai.GenerationConfig(
            temperature=TEMPERATURE,
            max_output_tokens=MAX_OUTPUT_TOKENS,
        ),
    )
 
    try:
        logger.info("Calling Gemini for station=%s platform=%s risk=%d", station, platform, risk_score)
        response = model.generate_content(user_message)
        raw = response.text.strip()
        logger.debug("Raw Gemini response: %s", raw)
 
        card = _parse_and_validate(raw)
        if card:
            logger.info("Action card generated. confidence=%.2f", card["confidence"])
        return card
 
    except Exception as exc:
        logger.error("Gemini call failed: %s", exc)
        return None
 
# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------
 
def _parse_and_validate(raw: str) -> Optional[dict]:
    """
    Parse JSON from Gemini response and validate required fields.
    Strips markdown fences if the model wraps output despite instructions.
    """
    # Strip accidental markdown fences
    clean = re.sub(r"```(?:json)?|```", "", raw).strip()
 
    try:
        card = json.loads(clean)
    except json.JSONDecodeError as exc:
        logger.error("JSON parse error: %s | raw=%s", exc, clean[:200])
        return None
 
    # Validate required keys
    required = {"summary", "actions", "time_window", "confidence"}
    missing = required - card.keys()
    if missing:
        logger.error("Action card missing keys: %s", missing)
        return None
 
    # Validate actions list
    if not isinstance(card["actions"], list) or len(card["actions"]) != 5:
        logger.error("Expected 5 actions, got: %s", card.get("actions"))
        return None
 
    # Clamp confidence to [0.0, 1.0]
    card["confidence"] = max(0.0, min(1.0, float(card["confidence"])))
 
    return card
 
# ---------------------------------------------------------------------------
# Quick local test  (python backend/prompt_config.py)
# ---------------------------------------------------------------------------
 
if __name__ == "__main__":
    sample = generate_action_card(
        station="Howrah",
        platform="P3",
        risk_score=84,
        delayed_trains=3,
        expected_passengers=1200,
        platform_capacity=800,
        time_to_critical=18,
    )
    if sample:
        print(json.dumps(sample, indent=2))
    else:
        print("Action card generation failed — check logs above.")