import os
import json
import httpx
from typing import Dict, Any, Optional
import logging
from backend.config import settings

logger = logging.getLogger("zenway.gemini_client")

class GeminiClient:
    def __init__(self):
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.cached_path = os.path.join(self.base_dir, "data", "cached_api_responses.json")
        self.api_key = settings.GEMINI_API_KEY
        self.url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"

    def _get_cached_action_card(self, scenario: str, station_id: str, platform_id: str) -> Optional[Dict[str, Any]]:
        try:
            if os.path.exists(self.cached_path):
                with open(self.cached_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    return data.get(scenario, {}).get(station_id, {}).get(platform_id, {}).get("action_card")
        except Exception as e:
            logger.error(f"Error loading cached Gemini response: {e}")
        return None

    async def generate_action_card(self, assessment: Dict[str, Any], demo: bool = False, scenario: str = "critical") -> Dict[str, Any]:
        """Generates an action card using Gemini 1.5 Flash or cached data."""
        station_id = assessment.get("station_id", "NDLS")
        platform_id = assessment.get("platform_id", "P1")
        score = assessment.get("score", 0.0)

        # Fallback 1: Demo mode / Cached responses
        if demo or not self.api_key:
            cached = self._get_cached_action_card(scenario, station_id, platform_id)
            if cached:
                logger.info(f"Returning cached Gemini action card for {scenario}/{station_id}/{platform_id}")
                return cached
            # If no scenario match, return a hardcoded fallback
            return self._get_default_action_card(station_id, platform_id, score)

        # Live mode
        system_prompt = (
            "You are a railway station safety AI. When crowd surge risk is Critical, generate "
            "a concise action card for the duty station master. Be specific. Be actionable. No filler. "
            "You must output exactly a JSON object matching this schema: "
            "{ \"summary\": \"brief explanation of the risk and trains\", \"actions\": [\"action 1\", \"action 2\", \"action 3\", \"action 4\", \"action 5\"], \"time_window\": \"time window (e.g. 10:15 - 10:45)\", \"confidence\": 0.95 }"
        )
        
        prompt = (
            f"Generate an action card. Input Data:\n"
            f"Station: {station_id}\n"
            f"Platform: {platform_id}\n"
            f"Surge Score: {score}\n"
            f"Contributing Factors: {json.dumps(assessment.get('contributing_factors', {}))}\n"
        )

        try:
            body = {
                "contents": [{
                    "parts": [{
                        "text": f"{system_prompt}\n\n{prompt}"
                    }]
                }],
                "generationConfig": {
                    "responseMimeType": "application/json"
                }
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(self.url, json=body)
                if res.status_code == 200:
                    res_data = res.json()
                    text_content = res_data["candidates"][0]["content"]["parts"][0]["text"]
                    logger.info(f"Gemini raw response: {text_content}")
                    # Parse text content as JSON
                    return json.loads(text_content.strip())
                else:
                    logger.error(f"Gemini API returned error {res.status_code}: {res.text}")
        except Exception as e:
            logger.error(f"Gemini API call failed: {e}. Falling back to cached data.")

        # Fallback 2: Network error, use cached
        cached = self._get_cached_action_card(scenario, station_id, platform_id)
        if cached:
            return cached
        return self._get_default_action_card(station_id, platform_id, score)

    def _get_default_action_card(self, station_id: str, platform_id: str, score: float) -> Dict[str, Any]:
        return {
            "summary": f"Crowd surge alert on Platform {platform_id} of station {station_id} (Score: {score}).",
            "actions": [
                "De-congest the platform immediately.",
                "Reroute footfalls to adjacent platforms.",
                "Deploy security staff for line control.",
                "Coordinate with train control.",
                "Broadcast audio PA alerts."
            ],
            "time_window": "Immediate (Next 30 mins)",
            "confidence": 0.85
        }

gemini_client = GeminiClient()
