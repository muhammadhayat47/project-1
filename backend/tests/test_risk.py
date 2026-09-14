"""Tests for /api/risk — AI job automation risk assessment."""


def test_assess_returns_valid_risk_level(client):
    res = client.post("/api/risk/assess", json={"job_title": "Data Entry Clerk"})
    assert res.status_code == 200
    body = res.json()
    assert body["risk_level"] in ("Low", "Medium", "High")
    assert 0 <= body["risk_score_pct"] <= 100
    assert len(body["drivers"]) > 0
    assert len(body["resilience_tips"]) > 0


def test_assess_probability_breakdown_sums_close_to_100(client):
    res = client.post("/api/risk/assess", json={"job_title": "Truck Driver"})
    body = res.json()
    total = sum(body["probability_breakdown"].values())
    assert 99 <= total <= 101  # allow for rounding


def test_assess_requires_job_title(client):
    res = client.post("/api/risk/assess", json={})
    assert res.status_code == 422


def test_assess_accepts_optional_description(client):
    res = client.post(
        "/api/risk/assess",
        json={"job_title": "Software Engineer", "job_description": "Designs and builds novel systems requiring judgment."},
    )
    assert res.status_code == 200
