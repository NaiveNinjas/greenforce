from collections import deque
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
