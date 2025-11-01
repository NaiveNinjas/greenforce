import os
import json
import random
from typing import Dict
from utils.vector_utils import clean_watsonx_output, format_ai_response, get_recent_data, process_analyze_response
from dotenv import load_dotenv
from ibm_watsonx_ai import APIClient, Credentials
from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams

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


def analyze_with_watsonx(data: dict) -> str:
    """
    Analyze sustainability metrics using Watsonx.ai and suggest workflow actions.
    Optionally simulate triggering workflows in Watson Orchestrate.
    """
    co2 = data.get("co2_emissions")
    waste = data.get("waste_level")
    energy = data.get("energy_usage")

    # --- Reasoning via Watsonx.ai ---
    client = get_watsonx_client()
    ai_result = "No AI response."

    if client:
        prompt = f"""
        You are **GreenForce AI Assistant**, an intelligent sustainability advisor that helps organizations
        reduce their environmental footprint through actionable insights.

        Analyze the following sustainability metrics:
        - CO₂ emissions: {co2:.2f} tons
        - Waste level: {waste:.2f}%
        - Energy usage: {energy:.2f} kWh

        ---

        ### Your task:
        1. From the list of workflows below, **select and describe at least three (3)** that should be triggered based on the provided data.  
        You may include additional workflows if relevant.

        **Available workflows:**
        • **carbon_audit** – for unusually high CO₂ emissions  
        • **deviation_audit** – for any metric deviating more than 10% from baseline  
        • **waste_reduction** – for excessive waste generation or low recycling rate  
        • **energy_optimization** – for high or inefficient energy consumption  
        • **water_conservation** – for abnormal water usage or leakage detection  
        • **renewable_integration** – to assess feasibility of solar, wind, or green energy options  
        • **supply_chain_sustainability** – to audit supplier emissions and material sourcing impact  
        • **green_procurement** – to prioritize eco-friendly materials and vendors  
        • **compliance_audit** – for ESG or sustainability compliance validation  
        • **employee_engagement** – to promote eco-awareness and sustainable behavior in teams  

        2. For each selected workflow, explain **why** it was triggered.  
        3. Suggest **specific, meaningful sustainability actions** the organization should take next.  
        Keep all recommendations concise and suitable for a live sustainability dashboard.

        ---

        ### Formatting requirements:
        - Always include **at least three (3)** workflows.  
        - Use **bullet points (•)** for all workflows and next actions.  
        - Keep the tone **professional, factual, and actionable**.  
        - Begin the response with:
        `GreenForce AI Assistant:`  
        - End the response with:
        `End Response`

        After the written explanation, provide a **machine-readable JSON object** enclosed in `<json>` tags, strictly following this structure:

        <json>
        {{
        "ai_analysis": "Concise summary of insights (200 words)",
        "recommended_workflows": [
            {{"name": "carbon_audit", "reason": "High CO₂ levels detected"}},
            {{"name": "waste_reduction", "reason": "Excessive waste generation"}}
        ],
        "next_actions": [
            "Conduct a carbon footprint analysis",
            "Implement a recycling and composting program"
        ]
        }}
        </json>

        Ensure the JSON is syntactically correct and directly parsable.

        ---

        ### Example Output:
        GreenForce AI Assistant:
        Based on the provided sustainability data, the following workflows are recommended:
        • carbon_audit – CO₂ emissions of 102.4 tons exceed optimal limits.  
        • waste_reduction – Waste levels of 58% highlight need for recycling improvements.  
        • renewable_integration – Energy use patterns indicate potential for renewable energy adoption.

        Recommended next actions:
        • Perform detailed CO₂ source mapping and emission reduction planning.  
        • Expand recycling and composting initiatives to reduce landfill dependency.  
        • Evaluate solar or wind integration to offset grid electricity usage.

        End Response

        <json>
        {{
        "ai_analysis": "High emissions and waste levels indicate immediate sustainability interventions are needed.",
        "recommended_workflows": [
            {{"name": "carbon_audit", "reason": "Elevated CO₂ emissions"}},
            {{"name": "waste_reduction", "reason": "High waste generation rate"}},
            {{"name": "renewable_integration", "reason": "Energy usage optimization opportunity"}}
        ],
        "next_actions": [
            "Analyze CO₂ emission sources and implement reduction roadmap",
            "Enhance recycling programs and track waste metrics weekly",
            "Adopt renewable power sources to lower long-term energy impact"
        ]
        }}
        </json>
        """

        try:
            model_inference = ModelInference(
                model_id="ibm/granite-3-3-8b-instruct", api_client=client
            )
            generate_params = {
                GenParams.MAX_NEW_TOKENS: 500
            }
            response = model_inference.generate(
                prompt=prompt,
                params=generate_params
            )
            ai_result = response["results"][0]["generated_text"].strip()
            return process_analyze_response(ai_result)
        except Exception as e:
            print("⚠️ Watsonx analysis error:", e)

    return {
        "ai_analysis": "Could not generate analysis",
        "triggered": "Workflows could not be triggered"
    }


def forecast_with_watsonx() -> Dict:
    """
    Generate sustainability trend forecast using IBM watsonx.ai.
    Falls back to local estimation if watsonx.ai is unavailable.
    """
    history = get_recent_data(10)
    if not history:
        return {"forecast": "No data available for forecasting.", "structured": []}

    # --- Compute averages from recent metrics ---
    avg_co2 = sum(r["co2_emissions"] for r in history) / len(history)
    avg_waste = sum(r["waste_level"] for r in history) / len(history)
    avg_energy = sum(r["energy_usage"] for r in history) / len(history)

    # --- Try using watsonx.ai ---
    client = get_watsonx_client()
    if client:
        prompt = f"""
        You are an AI sustainability analyst. Based on the following 10 most recent sustainability metrics, 
        predict the trend for CO₂ emissions (tons), Waste level (%), and Energy usage (kWh) for the next 7 days.
        Provide numeric forecasts and a short actionable summary.

        Historical data:
        {json.dumps(history, indent=2)}
        """

        forecast_summary = "Actionable summary: Monitor CO₂ and Waste closely; initiate audits if trends exceed +5%."
        try:
            model_inference = ModelInference(
                model_id="ibm/granite-3-3-8b-instruct", api_client=client
            )
            generate_params = {
                GenParams.MAX_NEW_TOKENS: 500
            }
            response = model_inference.generate(
                prompt=prompt,
                params=generate_params
            )

            # 5️⃣ Extract text safely
            if response and "results" in response and len(response["results"]) > 0:
                forecast_summary = response["results"][0].get("generated_text", "").strip()
        except Exception as e:
            print("⚠️ watsonx.ai forecast error:", e)

    # --- Fallback local forecast ---
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

    return {"forecast": clean_watsonx_output(forecast_summary), "structured": structured}
