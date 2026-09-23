"""Tests for /api/dashboard and /api/health."""


def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert body["database"] == "ok"
    assert "ai_enabled" in body
    assert "live_jobs_enabled" in body
    assert "email_enabled" in body


def test_dashboard_summary_unauthenticated(client):
    res = client.get("/api/dashboard/summary")
    assert res.status_code == 200
    body = res.json()
    assert body["signed_in"] is False
    assert body["resumes_uploaded"] == 0


def test_dashboard_summary_authenticated_reflects_activity(client, auth_headers):
    # Generate one roadmap so the dashboard has something to count.
    client.post(
        "/api/copilot/roadmap",
        json={"target_role": "QA Engineer", "known_skills": []},
        headers=auth_headers,
    )
    res = client.get("/api/dashboard/summary", headers=auth_headers)
    assert res.status_code == 200
    body = res.json()
    assert body["signed_in"] is True
    assert body["roadmaps_generated"] >= 1
