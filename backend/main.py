import asyncio
import datetime
import json
import random
from utils.watsonx_agent import analyze_with_watsonx, forecast_with_watsonx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

# Import in-memory vector utils
from utils.vector_utils import (
    get_recent_data,
    store_metrics_vector,
    find_similar_metrics,
)

# -----------------------
#  SETUP FASTAPI + CORS
# -----------------------
app = FastAPI(title="GreenForce Backend", version="2.1 (In-Memory Edition)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------
#  HELPER FUNCTIONS
# -----------------------
def generate_embedding(metric):
    """Convert metrics to a simple normalized embedding vector."""
    return [
        metric["co2_emissions"] / 150.0,
        metric["waste_level"] / 100.0,
        metric["energy_usage"] / 20000.0,
    ]


async def sensor_data_stream():
    """Stream simulated metrics every 5 seconds."""
    while True:
        metrics = {
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "co2_emissions": round(random.uniform(90, 120), 2),
            "waste_level": round(random.uniform(60, 85), 2),
            "energy_usage": round(random.uniform(12000, 15000), 2),
        }

        # Store data in in-memory DB
        try:
            store_metrics_vector(metrics)
        except Exception as e:
            print(f"⚠️ In-memory insert error: {e}")

        yield f"data: {json.dumps(metrics)}\n\n"
        await asyncio.sleep(5)


# -----------------------
#  ENDPOINTS
# -----------------------


@app.get("/")
def root():
    return {"status": "✅ GreenForce backend active"}


@app.get("/stream")
async def stream_metrics():
    """SSE stream for live simulated metrics."""
    return StreamingResponse(sensor_data_stream(), media_type="text/event-stream")


@app.get("/history")
def history():
    """Return most recent metrics."""
    data = get_recent_data()
    return {"history": data}


@app.post("/analyze")
def analyze_data(data: dict):
    """
    Analyze sustainability metrics using Watsonx.ai and suggest workflow actions.
    Optionally simulate triggering workflows in Watson Orchestrate.
    """
    return analyze_with_watsonx(data)


@app.post("/similar")
def find_similar(data: dict):
    """Find similar sustainability patterns from in-memory store."""
    try:
        results = find_similar_metrics(data, top_k=5)
        return {"similar": results}
    except Exception as e:
        print(f"⚠️ Similarity search failed: {e}")
        return {"similar": []}


@app.get("/forecast")
def forecast():
    """Generate sustainability trend forecast using Watsonx.ai"""
    return forecast_with_watsonx()
