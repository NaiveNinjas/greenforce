import asyncio
import datetime
import json
import random
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

# Import in-memory vector utils
from utils.vector_utils import (
    store_metrics_vector,
    get_recent_metrics,
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


def get_recent_data(limit=100):
    """Retrieve last N records from in-memory DB."""
    try:
        return get_recent_metrics(limit)
    except Exception as e:
        print(f"⚠️ History retrieval error: {e}")
        return []


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
    """Simple rule-based workflow trigger."""
    actions = []
    if data["co2_emissions"] > 110:
        actions.append({"workflow": "carbon_audit"})
    if data["waste_level"] > 80:
        actions.append({"workflow": "waste_reduction"})
    if data["energy_usage"] > 14000:
        actions.append({"workflow": "energy_optimization"})

    triggered = [
        {"workflow": act["workflow"], "result": "Triggered"} for act in actions
    ]

    recommendation = (
        "Increase monitoring of energy efficiency and schedule a maintenance check."
        if actions
        else "All metrics are within sustainable range. Keep monitoring."
    )

    return {"actions": triggered, "recommendation": recommendation}


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
    history = get_recent_data(10)
    if not history:
        return {"forecast": "No data available for forecasting.", "structured": []}

    avg_co2 = sum(r["co2_emissions"] for r in history) / len(history)
    avg_waste = sum(r["waste_level"] for r in history) / len(history)
    avg_energy = sum(r["energy_usage"] for r in history) / len(history)

    trend_co2 = random.uniform(0.98, 1.05)
    trend_waste = random.uniform(0.97, 1.04)
    trend_energy = random.uniform(0.96, 1.03)

    structured = [
        {
            "metric": "CO₂",
            "latest": round(avg_co2, 2),
            "predicted": round(avg_co2 * trend_co2, 2),
        },
        {
            "metric": "Waste",
            "latest": round(avg_waste, 2),
            "predicted": round(avg_waste * trend_waste, 2),
        },
        {
            "metric": "Energy",
            "latest": round(avg_energy, 2),
            "predicted": round(avg_energy * trend_energy, 2),
        },
    ]

    def trend_symbol(val: float, threshold: float = 0.02) -> str:
        """
        Return a color-coded HTML trend indicator based on the deviation from 1.0.

        Args:
            val (float): Trend ratio (e.g., 1.03 means +3% rise)
            threshold (float): Stability threshold (default ±2%)

        Returns:
            str: HTML span with color and trend arrow.
        """
        if val > 1 + threshold:
            return '<span style="color:#2B7AE4;">↑ rising</span>'
        elif val < 1 - threshold:
            return '<span style="color:#E4572E;">↓ falling</span>'
        else:
            return '<span style="color:#9CA3AF;">→ stable</span>'

    forecast_text = f"""
    Forecast:
    - CO₂: {structured[0]['predicted']} tons ({trend_symbol(trend_co2)})
    - Waste: {structured[1]['predicted']}% ({trend_symbol(trend_waste)})
    - Energy: {structured[2]['predicted']} kWh ({trend_symbol(trend_energy)})

    Action: Monitor CO₂ and Waste closely; initiate audit if trend exceeds +5%.
    """

    return {"forecast": forecast_text.strip(), "structured": structured}
