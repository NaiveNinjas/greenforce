import asyncio
import datetime
import json
import os
import random
from typing import Optional
import time
import requests
from utils.orchestrate_agent import get_ibm_access_token
from fastapi import FastAPI,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse,JSONResponse
import httpx
from utils.watsonx_agent import analyze_with_watsonx, forecast_with_watsonx


# Import in-memory vector utils
from utils.vector_utils import (
    get_recent_data,
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


THREAD_ENDPOINT =  os.getenv("THREAD_ENDPOINT")
RUN_RESULT_URL = THREAD_ENDPOINT + "/"


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
    

async def get_or_create_thread(
    query: str, token: str, thread_id: Optional[str] = None
) -> str:
    """Creates a thread when needed and returns its id."""
    if thread_id:
        return thread_id
    headers = {"Authorization": f"Bearer {token}"}
    body = {"message": {"role": "user", "content": query}}
    r = requests.post(THREAD_ENDPOINT, headers=headers, json=body)
    r.raise_for_status()

    data = r.json()
    tid = data.get("thread_id")

    if not tid:
        raise HTTPException(
            status_code=502, detail="Upstream did not return thread_id."
        )
    return tid


def _extract_final_text(payload: dict) -> str:
    """Looks in common locations for final text."""
    if not isinstance(payload, dict):
        return ""
    try:
        contents = payload["result"]["data"]["message"]["content"]
        if isinstance(contents, list):
            texts = [
                c.get("text")
                for c in contents
                if isinstance(c, dict) and isinstance(c.get("text"), str)
            ]
            if texts:
                dedup = list(dict.fromkeys(texts))
                return "\n".join(dedup).strip()
    except Exception:
        pass
    if isinstance(payload.get("response"), str) and payload["response"].strip():
        return payload["response"].strip()
    content = payload.get("content")
    if isinstance(content, list):
        texts = [
            c.get("text")
            for c in content
            if isinstance(c, dict) and isinstance(c.get("text"), str)
        ]
        if texts:
            dedup = list(dict.fromkeys(texts))
            return "\n".join(dedup).strip()
    return ""

async def _poll_run_result(
    run_id: str, headers: dict, timeout_s: int = 60, interval_s: float = 0.7
):
    """Polls <RUN_RESULT_URL>/<run_id> until completed or failed or timeout."""
    url = f"{RUN_RESULT_URL.rstrip('/')}/{run_id}"
    start = time.time()
    while True:
        r = requests.get(url, headers=headers)
        r.raise_for_status()
        data = r.json()
        status = (
            data.get("status") or data.get("state") or data.get("run_status") or ""
        ).lower()
        if status in {"completed", "succeeded", "success", "done"}:
            return data
        if status in {"failed", "error", "cancelled"}:
            raise HTTPException(
                status_code=400, detail=f"Run failed: {json.dumps(data)}"
            )
        if time.time() - start > timeout_s:
            raise HTTPException(status_code=408, detail="Polling timed out.")
        await asyncio.sleep(interval_s)

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
    

@app.get("/get-result")
async def get_result(query: str, agent_id: str):
    try:
        token = get_ibm_access_token()
        headers = {"Authorization": f"Bearer {token}"}

        async with httpx.AsyncClient(timeout=10.0) as client:
            task_response = await client.post(THREAD_ENDPOINT, headers=headers, json={
                "message": {
                    "role": "user",
                    "content": query
                },
                "agent_id": agent_id
            })

            if task_response.status_code != 200:
                raise HTTPException(
                    status_code=task_response.status_code,
                    detail=f"Error from orchestration API: {task_response.text}"
                )

            run_id = task_response.json().get("run_id")

        result_url = f"{RUN_RESULT_URL}{run_id}"

        timeout = 60
        interval = 2
        start_time = time.time()

        while True:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(result_url, headers=headers)
                response.raise_for_status()
                data = response.json()

            status = data.get("status")
            result = data.get("result")

            if status == "completed":
                return {"message": "✅ Task completed.", "result": result}
            elif status == "failed":
                raise HTTPException(status_code=400, detail="❌ Task failed.")
            elif time.time() - start_time > timeout:
                raise HTTPException(status_code=408, detail="⏱️ Polling timed out.")

            await asyncio.sleep(interval)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"🔴 Server error: {str(e)}")

# === /chat: STREAMING ENDPOINT ===
@app.get("/chat")
async def chat_non_stream(
    query: str,
    agent_id: str,
    thread_id: Optional[str] = None,
    include_raw: int = 0,  # <-- made plain int
):
    """Non-streaming convenience endpoint. Tries inline result; if needed, polls by run_id."""
    try:
        token = get_ibm_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }
        body = {"message": {"role": "user", "content": query}, "agent_id": agent_id}
        if thread_id:
            body["thread_id"] = thread_id
        params = {"stream": "false", "multiple_content": "true"}

        trig = requests.post(
            THREAD_ENDPOINT, headers=headers, params=params, json=body
        )
        trig.raise_for_status()
        trig_data = trig.json()

        inline_text = _extract_final_text(trig_data)
        returned_thread = trig_data.get("thread_id") or thread_id
        if inline_text:
            out = {
                "error_message": False,
                "status": "completed",
                "response": inline_text,
                "thread_id": returned_thread,
            }
            if include_raw:
                out["raw"] = trig_data
            return JSONResponse(out)

        run_id = trig_data.get("run_id")
        if not run_id:
            out = {
                "error_message": False,
                "status": trig_data.get("status") or "unknown",
                "response": "",
                "thread_id": returned_thread,
            }
            if include_raw:
                out["raw"] = trig_data
            return JSONResponse(out)

        final_data = await _poll_run_result(run_id, headers)
        final_text = _extract_final_text(final_data) or ""
        returned_thread = final_data.get("thread_id") or returned_thread
        status = final_data.get("status") or "completed"

        out = {
            "error_message": False,
            "status": str(status),
            "response": final_text,
            "thread_id": returned_thread,
        }
        if include_raw:
            out["raw"] = final_data
        return JSONResponse(out)

    except httpx.HTTPStatusError as http_err:
        detail = (
            http_err.response.text if http_err.response is not None else str(http_err)
        )
        raise HTTPException(
            status_code=http_err.response.status_code if http_err.response else 502,
            detail=f"Upstream error: {detail}",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    
@app.get("/chat/v2", response_class=StreamingResponse)
async def chat_with_agent(query: str, agent_id: str, thread_id: str = None):
    try:
        token = get_ibm_access_token()
        thread_id = await get_or_create_thread(query, token, thread_id)

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        body = {
            "message": {
                "role": "user",
                "content": query
            },
            "agent_id": agent_id,
            "thread_id": thread_id
        }

        params = {
            "stream": "true",
            "stream_timeout": "120000",
            "multiple_content": "true"
        }

        async def stream_response():
            async with httpx.AsyncClient(timeout=None) as client:
                async with client.stream("POST", THREAD_ENDPOINT, headers=headers, params=params, json=body) as response:
                    if response.status_code != 200:
                        error_text = await response.aread()
                        raise HTTPException(status_code=response.status_code, detail=error_text.decode())

                    async for chunk in response.aiter_text():
                        chunk = chunk.strip()
                        if not chunk:
                            continue
                        try:
                            event = json.loads(chunk)
                            if event["event"] == "message.delta":
                                contents = event["data"]["delta"].get("content", [])
                                for part in contents:
                                    if part.get("response_type") == "text":
                                        response_json = {
                                            "error_message": False,
                                            "response": part["text"],
                                            "thread_id": thread_id
                                        }
                                        yield f"data: {json.dumps(response_json)}\n\n"
                        except json.JSONDecodeError:
                            continue

        return StreamingResponse(stream_response(), media_type="text/event-stream")

    except httpx.HTTPStatusError as http_err:
        raise HTTPException(status_code=http_err.response.status_code, detail=f"HTTP error: {http_err}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"🔥 Internal server error: {str(e)}")


@app.get("/forecast")
def forecast():
    """Generate sustainability trend forecast using Watsonx.ai"""
    return forecast_with_watsonx()
