"""
Autonomous Job Application Agent — job sourcing + matching half.

Job sourcing has two modes:
  - Live mode: if ADZUNA_APP_ID / ADZUNA_APP_KEY are set, pulls real listings
    from the Adzuna Jobs API (a legitimate public jobs API with an
    application process, unlike LinkedIn/Indeed which prohibit automated
    login and application bots in their terms of service).
  - Demo mode (default, zero config): draws from the bundled synthetic
    listings in `seed_data.job_seed_listings`, which are realistic in
    structure (title, company, salary, description, apply_url) so every
    downstream feature — matching, cover letters, the application queue —
    is exercised exactly as it would be with live data.

Every listing is scored against the user's resume with the same
skill-matching engine used by the Skill Gap Analyzer, so results are
ranked by genuine fit, not just recency.
"""
from __future__ import annotations

import requests

from app.config import get_settings
from app.services.seed_data import job_seed_listings
from app.services.skill_matcher import analyze_gap

settings = get_settings()

ADZUNA_BASE = "https://api.adzuna.com/v1/api/jobs"


def _fetch_adzuna(role: str, location: str | None, remote_only: bool, limit: int) -> list[dict] | None:
    if not settings.live_jobs_enabled:
        return None
    country = "us"
    try:
        params = {
            "app_id": settings.ADZUNA_APP_ID,
            "app_key": settings.ADZUNA_APP_KEY,
            "results_per_page": limit,
            "what": role,
            "content-type": "application/json",
        }
        if location:
            params["where"] = location
        resp = requests.get(f"{ADZUNA_BASE}/{country}/search/1", params=params, timeout=8)
        resp.raise_for_status()
        data = resp.json()
        listings = []
        for item in data.get("results", []):
            listings.append({
                "id": str(item.get("id")),
                "title": item.get("title", role),
                "company": (item.get("company") or {}).get("display_name", "Unknown company"),
                "location": (item.get("location") or {}).get("display_name", location or "Unspecified"),
                "remote": "remote" in (item.get("title", "") + item.get("description", "")).lower(),
                "salary_usd": item.get("salary_min"),
                "description": item.get("description", ""),
                "apply_url": item.get("redirect_url", "#"),
                "posted_days_ago": 0,
            })
        return listings or None
    except Exception:
        return None  # network hiccup / bad key -> silently fall back to demo mode


def find_matching_jobs(resume_text: str, target_role: str, target_location: str | None,
                        remote_only: bool, max_results: int) -> dict:
    live = _fetch_adzuna(target_role, target_location, remote_only, max_results)
    listings = live if live is not None else job_seed_listings(target_role, target_location, remote_only, limit=max(max_results * 2, 24))

    scored = []
    for job in listings:
        gap = analyze_gap(resume_text, job["description"])
        job_with_score = {**job, "match_score_pct": gap["match_score_pct"]}
        scored.append(job_with_score)

    scored.sort(key=lambda j: j["match_score_pct"], reverse=True)
    top = scored[:max_results]

    return {
        "query_role": target_role,
        "total_considered": len(listings),
        "jobs": top,
    }
