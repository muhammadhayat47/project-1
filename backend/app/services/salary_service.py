"""Global Salary Mapping module."""
from __future__ import annotations

from app.services.seed_data import salary_points_for_role


def get_salary_map(role: str) -> dict:
    points = salary_points_for_role(role)
    global_median = sorted(p["median_salary_usd"] for p in points)[len(points) // 2]
    return {
        "role": role,
        "currency": "USD",
        "points": points,
        "global_median_usd": global_median,
    }
