import asyncio
import logging
import pytest
from backend.agent import run_alert_agent

logging.basicConfig(level=logging.INFO)

@pytest.mark.asyncio
async def test():
    mock_assessment = {
        "station_id": "NDLS",
        "platform_id": "P1",
        "score": 91.0,
        "contributing_factors": {
            "platform_capacity": 2000,
            "typical_load": 500,
            "expected_passengers_from_delayed_trains": 1320,
            "delayed_trains_count": 3
        },
        "calculated_at": "2026-06-11T10:00:00Z"
    }
    
    print("Running alert agent test...")
    try:
        res = await run_alert_agent(mock_assessment, demo=True, scenario="critical")
        print("Agent ran successfully!")
        print("Alert:", res.get("alert"))
        print("Steps count:", len(res.get("agent_run", {}).get("steps", [])))
    except Exception as e:
        import traceback
        print("Agent run failed with exception:")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
