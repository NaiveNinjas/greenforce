import asyncio
import json
import random
import time
from typing import Dict
from utils.vector_utils import store_metrics_vector


# --- Generate random metrics ---
def generate_metrics() -> Dict:
    return {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "co2_emissions": round(random.uniform(80, 150), 2),
        "waste_level": round(random.uniform(30, 90), 1),
        "energy_usage": round(random.uniform(10000, 18000), 1),
    }


# --- Live data stream (SSE) ---
async def stream_metrics():
    while True:
        data = generate_metrics()
        try:
            store_metrics_vector(data)
        except Exception as e:
            # log but continue streaming
            print("Vector store error:", e)
        yield f"data: {json.dumps(data)}\n\n"
        await asyncio.sleep(5)
