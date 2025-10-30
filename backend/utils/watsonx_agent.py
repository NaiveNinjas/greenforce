import os
import json
from dotenv import load_dotenv
from ibm_watsonx_ai import APIClient, Credentials

load_dotenv()

WATSONX_API_KEY = os.getenv("WATSONX_API_KEY", "")
WATSONX_URL = os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
WATSONX_PROJECT_ID = os.getenv("WATSONX_PROJECT_ID", "")

def get_watsonx_client():
    """Initialize watsonx.ai client if credentials exist."""
    if not (WATSONX_API_KEY and WATSONX_PROJECT_ID):
        return None
    try:
        creds = Credentials(url=WATSONX_URL, api_key=WATSONX_API_KEY)
        return APIClient(credentials=creds, project_id=WATSONX_PROJECT_ID)
    except Exception as e:
        print("⚠️ Watsonx init error:", e)
        return None


def analyze_with_watsonx(metrics: dict) -> str:
    """Analyze sustainability data with watsonx.ai or fallback."""
    prompt = f"""
    Analyze the following sustainability metrics:
    - CO₂ emissions: {metrics['co2_emissions']} tons
    - Waste level: {metrics['waste_level']}%
    - Energy usage: {metrics['energy_usage']} kWh

    Suggest sustainability actions aligned with UN SDGs.
    """

    client = get_watsonx_client()
    if client:
        try:
            response = client.generate_text(
                model="ibm/granite-13b-chat-v2",
                prompt=prompt,
                max_new_tokens=300,
            )
            return response.get("results", [{}])[0].get("generated_text", "").strip()
        except Exception as e:
            print("⚠️ Watsonx analysis error:", e)

    # --- Fallback ---
    return (
        f"⚙️ Fallback AI: Emissions {metrics['co2_emissions']} tons, "
        f"Waste {metrics['waste_level']}%, Energy {metrics['energy_usage']} kWh. "
        f"Consider reducing energy use or scheduling maintenance."
    )


def forecast_with_watsonx(history: list):
    """Generate 7-day forecast using watsonx.ai or fallback."""
    if not history:
        return "Not enough data for forecast.", []

    avg_co2 = sum(d["co2_emissions"] for d in history) / len(history)
    avg_waste = sum(d["waste_level"] for d in history) / len(history)
    avg_energy = sum(d["energy_usage"] for d in history) / len(history)

    # --- If Watsonx available ---
    client = get_watsonx_client()
    if client:
        prompt = f"""
        Predict next week's sustainability trends based on:
        {json.dumps(history[-10:], indent=2)}

        Output a forecast for:
        - CO₂ emissions (tons)
        - Waste level (%)
        - Energy usage (kWh)
        With actionable insights.
        """
        try:
            response = client.generate_text(
                model="ibm/granite-13b-chat-v2",
                prompt=prompt,
                max_new_tokens=300,
            )
            text = response.get("results", [{}])[0].get("generated_text") or "No forecast"
            return text, []
        except Exception as e:
            print("⚠️ Watsonx forecast error:", e)

    # --- Fallback Forecast (trend-based numeric + text) ---
    structured = []
    if len(history) >= 2:
        prev, latest = history[-2], history[-1]

        def ratio(new, old): return new / old if old else 1

        structured = [
            {
                "metric": "CO₂ Emissions (tons)",
                "latest": latest["co2_emissions"],
                "predicted": latest["co2_emissions"] * ratio(latest["co2_emissions"], prev["co2_emissions"]),
            },
            {
                "metric": "Waste Level (%)",
                "latest": latest["waste_level"],
                "predicted": latest["waste_level"] * ratio(latest["waste_level"], prev["waste_level"]),
            },
            {
                "metric": "Energy Usage (kWh)",
                "latest": latest["energy_usage"],
                "predicted": latest["energy_usage"] * ratio(latest["energy_usage"], prev["energy_usage"]),
            },
        ]
    else:
        structured = [
            {"metric": "CO₂ Emissions (tons)", "latest": avg_co2, "predicted": avg_co2},
            {"metric": "Waste Level (%)", "latest": avg_waste, "predicted": avg_waste},
            {"metric": "Energy Usage (kWh)", "latest": avg_energy, "predicted": avg_energy},
        ]

    text = f"""
Forecast (Fallback AI):
- CO₂: {avg_co2:.1f} tons
- Waste: {avg_waste:.1f}%
- Energy: {avg_energy:.0f} kWh
Action: Continue monitoring; perform energy audits if trends exceed +5% next week.
"""
    return text, structured
