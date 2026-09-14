"""
Synthetic-but-realistic datasets that stand in for the live data sources
named in the proposal (LinkedIn Jobs API, Glassdoor, O*NET, 2 years of
historical hiring data). Everything here is deterministic (fixed seed) so
numbers are stable across restarts, and every generator is pure/offline so
the app needs no external accounts to demonstrate real functionality.

Swap-in path to live data: replace `hiring_history_for_role()` with a call
to a jobs API of your choice, and `job_seed_listings()` with
`app/services/job_service.py`'s Adzuna client (already wired, just needs
ADZUNA_APP_ID / ADZUNA_APP_KEY in .env).
"""
from __future__ import annotations

import hashlib
import math
import random
from datetime import datetime, timedelta

from app.utils.taxonomy import COMPANIES, COUNTRIES, JOB_TITLES

MONTHS = 24


def _seeded_random(*parts: str) -> random.Random:
    key = "|".join(parts)
    seed = int(hashlib.sha256(key.encode()).hexdigest(), 16) % (2**32)
    return random.Random(seed)


def hiring_history_for_role(role: str, location: str = "Global") -> list[float]:
    """24 months of synthetic hiring-post counts with trend + seasonality + noise."""
    rnd = _seeded_random("hiring", role.lower(), location.lower())
    base = 60 + rnd.randint(0, 140)
    trend = rnd.uniform(-1.0, 3.0)  # some roles cooling, most growing
    seasonal_amp = rnd.uniform(5, 20)
    noise = rnd.uniform(4, 12)

    values = []
    for t in range(MONTHS):
        seasonal = seasonal_amp * math.sin(2 * math.pi * t / 12)
        val = base + trend * t + seasonal + rnd.gauss(0, noise)
        values.append(max(0.0, round(val, 1)))
    return values


def top_hiring_companies_for_role(role: str, location: str = "Global") -> list[dict]:
    rnd = _seeded_random("companies", role.lower(), location.lower())
    picks = rnd.sample(COMPANIES, k=5)
    results = []
    for c in picks:
        results.append({
            "company": c,
            "open_roles": rnd.randint(3, 42),
            "hiring_trend_pct": round(rnd.uniform(-15, 45), 1),
        })
    results.sort(key=lambda r: r["open_roles"], reverse=True)
    return results


def salary_points_for_role(role: str) -> list[dict]:
    """Synthetic median salary + remote share + demand index per country for a role."""
    rnd = _seeded_random("salary", role.lower())
    role_base = 45000 + (hash(role.lower()) % 60000)  # role-level base, stable per role
    points = []
    for c in COUNTRIES:
        local_rnd = _seeded_random("salary", role.lower(), c["code"])
        median = role_base * c["cost_index"] * local_rnd.uniform(0.85, 1.2)
        points.append({
            "country": c["country"],
            "country_code": c["code"],
            "lat": c["lat"],
            "lon": c["lon"],
            "median_salary_usd": round(median, -2),
            "remote_share_pct": round(local_rnd.uniform(15, 75), 1),
            "demand_index": round(local_rnd.uniform(0.2, 1.0), 2),
        })
    return points


def job_seed_listings(role: str, location: str | None, remote_only: bool, limit: int = 30) -> list[dict]:
    """A bundled, realistic pool of job listings used when no live jobs API key is set."""
    rnd = _seeded_random("jobs", role.lower(), (location or "any").lower())
    listings = []
    locations_pool = [c["country"] for c in COUNTRIES] + ["Remote"]
    for i in range(limit):
        remote = remote_only or rnd.random() < 0.4
        loc = "Remote" if remote else rnd.choice(locations_pool[:-1])
        company = rnd.choice(COMPANIES)
        posted_days = rnd.randint(0, 21)
        salary = 40000 + (hash(role.lower()) % 50000) * rnd.uniform(0.8, 1.3)
        job_id = hashlib.md5(f"{role}-{company}-{i}".encode()).hexdigest()[:10]
        listings.append({
            "id": job_id,
            "title": role,
            "company": company,
            "location": loc,
            "remote": remote,
            "salary_usd": round(salary, -2),
            "description": _synthetic_description(role, rnd),
            "apply_url": f"https://careeros-demo-jobs.example.com/jobs/{job_id}",
            "posted_days_ago": posted_days,
        })
    return listings


def _synthetic_description(role: str, rnd: random.Random) -> str:
    from app.utils.taxonomy import SKILLS_TAXONOMY

    skills = rnd.sample(SKILLS_TAXONOMY, k=6)
    seniority = rnd.choice(["Junior", "Mid-level", "Senior"])
    return (
        f"{seniority} {role} needed to join a growing product team. "
        f"You'll work closely with cross-functional stakeholders on real-world "
        f"problems. Required / preferred skills: {', '.join(skills)}. "
        f"We value clear communication, ownership, and a bias for shipping."
    )


def risk_training_dataset() -> list[dict]:
    """Seed dataset used to train the AI-automation-risk classifier at startup."""
    # (title, routineness, creativity, social, physical, data_driven, label)
    rows = [
        ("Data Entry Clerk", 0.95, 0.05, 0.10, 0.05, 0.90, "High"),
        ("Cashier", 0.85, 0.05, 0.30, 0.20, 0.60, "High"),
        ("Telemarketer", 0.80, 0.10, 0.40, 0.05, 0.50, "High"),
        ("Bookkeeper", 0.80, 0.10, 0.20, 0.02, 0.85, "High"),
        ("Assembly Line Worker", 0.90, 0.05, 0.10, 0.90, 0.30, "High"),
        ("Proofreader", 0.75, 0.15, 0.10, 0.02, 0.55, "High"),
        ("Toll Booth Operator", 0.92, 0.02, 0.15, 0.30, 0.20, "High"),
        ("Paralegal", 0.60, 0.25, 0.30, 0.02, 0.70, "Medium"),
        ("Financial Analyst", 0.55, 0.30, 0.40, 0.02, 0.85, "Medium"),
        ("Customer Support Specialist", 0.60, 0.20, 0.70, 0.05, 0.40, "Medium"),
        ("Marketing Coordinator", 0.45, 0.55, 0.55, 0.05, 0.50, "Medium"),
        ("QA Engineer", 0.55, 0.35, 0.30, 0.02, 0.60, "Medium"),
        ("Electrician", 0.35, 0.40, 0.50, 0.85, 0.15, "Medium"),
        ("Truck Driver", 0.70, 0.10, 0.20, 0.80, 0.25, "Medium"),
        ("HR Generalist", 0.50, 0.35, 0.75, 0.02, 0.45, "Medium"),
        ("Recruiter", 0.50, 0.30, 0.80, 0.02, 0.45, "Medium"),
        ("Business Analyst", 0.45, 0.45, 0.55, 0.02, 0.75, "Medium"),
        ("Graphic Designer", 0.30, 0.85, 0.30, 0.05, 0.30, "Low"),
        ("Registered Nurse", 0.25, 0.40, 0.90, 0.60, 0.35, "Low"),
        ("Software Engineer", 0.35, 0.75, 0.40, 0.02, 0.55, "Low"),
        ("Product Manager", 0.25, 0.65, 0.85, 0.02, 0.45, "Low"),
        ("Psychologist", 0.15, 0.55, 0.95, 0.05, 0.25, "Low"),
        ("Data Scientist", 0.35, 0.70, 0.40, 0.02, 0.90, "Low"),
        ("Teacher", 0.25, 0.60, 0.90, 0.10, 0.30, "Low"),
        ("UI/UX Designer", 0.25, 0.85, 0.55, 0.02, 0.35, "Low"),
        ("ML Engineer", 0.30, 0.65, 0.35, 0.02, 0.92, "Low"),
        ("Physician", 0.15, 0.45, 0.90, 0.40, 0.40, "Low"),
        ("Skilled Tradesperson (Plumber)", 0.30, 0.35, 0.55, 0.90, 0.10, "Low"),
        ("Event Planner", 0.30, 0.65, 0.85, 0.20, 0.30, "Low"),
        ("Management Consultant", 0.20, 0.60, 0.85, 0.02, 0.65, "Low"),
    ]
    return [
        {
            "title": r[0], "routineness": r[1], "creativity": r[2],
            "social": r[3], "physical": r[4], "data_driven": r[5], "risk": r[6],
        }
        for r in rows
    ]
