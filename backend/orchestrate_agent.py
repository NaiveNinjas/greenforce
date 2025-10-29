import os, requests
from dotenv import load_dotenv

load_dotenv()

IBM_ORCH_INSTANCE_ID = os.getenv("IBM_ORCH_INSTANCE_ID")
IBM_ORCH_REGION = os.getenv("IBM_ORCH_REGION")
API_KEY = os.getenv("IBM_API_KEY")
IBM_TOKEN_URL = os.getenv("IBM_TOKEN_URL")

def get_ibm_access_token():
    data = {
        "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
        "apikey": API_KEY
    }
    try:
        resp = requests.post(IBM_TOKEN_URL, data=data)
        resp.raise_for_status()
        return resp.json().get("access_token")
    except Exception as e:
        print(f"[Token Error] {e}")
        return None

def trigger_workflow(workflow_name, context):
    token = get_ibm_access_token()
    if not token:
        return {"error": "Auth failed"}
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    payload = {"name": workflow_name, "inputs": context}
    try:
        r = requests.post(f"https://api.{IBM_ORCH_REGION}.watson-orchestrate.cloud.ibm.com/instances/{IBM_ORCH_INSTANCE_ID}/v1/orchestrate/digital-employees/allskills", headers=headers, json=payload)
        return r.json()
    except Exception as e:
        return {"error": str(e)}

def analyze_environmental_data(data):
    actions = []
    if data.get("co2_emissions", 0) > 100:
        actions.append({"workflow": "CarbonAuditWorkflow"})
    if data.get("waste_level", 0) > 80:
        actions.append({"workflow": "WasteCollectionWorkflow"})
    if data.get("energy_usage", 0) > 12000:
        actions.append({"workflow": "EnergyOptimizationWorkflow"})
    return actions
