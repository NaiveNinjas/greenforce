from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from orchestrate_agent import analyze_environmental_data, trigger_workflow

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

@app.get("/")
def root():
    return {"status": "GreenForce backend active"}

@app.post("/analyze")
def analyze_data(data: dict):
    actions = analyze_environmental_data(data)
    triggered = []
    for act in actions:
        result = trigger_workflow(act["workflow"], {"metrics": data})
        triggered.append({"workflow": act["workflow"], "result": result})
    return {"actions": triggered}
