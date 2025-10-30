from collections import deque
import re
from typing import List, Dict
from datetime import datetime
import math

# Configuration
MAX_MEMORY_RECORDS = 1000  # rolling memory cap
VECTOR_DIM = 3  # [co2, waste, energy]

# In-memory store: list of {timestamp, co2_emissions, waste_level, energy_usage}
_memory_store: deque = deque(maxlen=MAX_MEMORY_RECORDS)


def _vector_from_metrics(metrics: Dict) -> List[float]:
    """Extracts a numeric vector [co2, waste, energy] from metrics dict."""
    return [
        float(metrics.get("co2_emissions", 0.0)),
        float(metrics.get("waste_level", 0.0)),
        float(metrics.get("energy_usage", 0.0)),
    ]


def init_collection():
    return True


def store_metrics_vector(metrics: Dict):
    """
    Store a metric record in memory.
    metrics: { timestamp, co2_emissions, waste_level, energy_usage }
    """
    if "timestamp" not in metrics:
        metrics["timestamp"] = datetime.utcnow().isoformat()
    _memory_store.append(metrics)
    print(f"[InMemoryDB] Stored metrics ({len(_memory_store)} total).")


def get_recent_metrics(limit: int = 30) -> List[Dict]:
    """Return up to the last `limit` metric entries, sorted by timestamp."""
    recent = list(_memory_store)[-limit:]
    return sorted(recent, key=lambda x: x["timestamp"])


def find_similar_metrics(current_metrics: Dict, top_k: int = 5) -> List[Dict]:
    """
    Return top_k metrics most similar (by Euclidean distance) to the current one.
    """
    if not _memory_store:
        return []

    current_vec = _vector_from_metrics(current_metrics)

    def euclidean_distance(v1, v2):
        return math.sqrt(sum((a - b) ** 2 for a, b in zip(v1, v2)))

    scored = []
    for record in _memory_store:
        vec = _vector_from_metrics(record)
        distance = euclidean_distance(current_vec, vec)
        scored.append((distance, record))

    # Sort by smallest distance (most similar)
    scored_sorted = sorted(scored, key=lambda x: x[0])[:top_k]

    return [
        {
            "timestamp": r["timestamp"],
            "co2_emissions": r["co2_emissions"],
            "waste_level": r["waste_level"],
            "energy_usage": r["energy_usage"],
            "score": round(d, 4),
        }
        for d, r in scored_sorted
    ]


def get_recent_data(limit=100):
    """Retrieve last N records from in-memory DB."""
    try:
        return get_recent_metrics(limit)
    except Exception as e:
        print(f"⚠️ History retrieval error: {e}")
        return []


def clean_watsonx_output(text: str) -> str:
    """Cleans Watsonx output by removing markdown artifacts and truncating at 'End Response'."""
    if not text:
        return ""

    # Remove markdown-style heading symbols like #### or ##
    cleaned = re.sub(r"^#+\s*", "", text, flags=re.MULTILINE)

    # Truncate anything after 'End Response' (case-insensitive)
    match = re.search(r"end\s*response", cleaned, flags=re.IGNORECASE)
    if match:
        cleaned = cleaned[:match.start()]

    # Strip whitespace and newlines
    return cleaned.strip()

import re

def format_ai_response(text: str) -> str:
    """
    Clean and format Watsonx.ai text into readable Carbon 11–compliant HTML.
    """
    if not text:
        return '<p class="cds--label">No analysis available.</p>'

    # Clean and preprocess
    text = text.replace("#", "").split("End Response")[0].strip()

    # Normalize numbered lists to bullet format
    text = re.sub(r"\s*\d+\.\s*", "\n• ", text)

    # Split into lines, trim whitespace
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    formatted_blocks = []
    list_items = []

    def flush_list():
        nonlocal list_items, formatted_blocks
        if list_items:
            ul = "<ul class='cds--list--unordered'>" + "".join(
                f"<li class='cds--list__item'>{item}</li>" for item in list_items
            ) + "</ul>"
            formatted_blocks.append(ul)
            list_items = []

    for line in lines:
        if line.startswith("•"):
            list_items.append(line[1:].strip())
        elif line.lower().startswith(("greenforce", "summary", "action", "workflow", "recommendation")):
            flush_list()
            formatted_blocks.append(
                f"<h5 class='cds--heading-compact' style='color:#0f62fe;margin-top:1rem;'>{line}</h5>"
            )
        else:
            flush_list()
            formatted_blocks.append(f"<p class='cds--body-long-01' style='margin:0.25rem 0;'>{line}</p>")

    flush_list()

    html = "<div class='cds--content'>" + "".join(formatted_blocks) + "</div>"
    return html
