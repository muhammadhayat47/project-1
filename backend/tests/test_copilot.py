"""Tests for /api/copilot — AI-generated career roadmap."""


def test_roadmap_generates_weeks_and_summary(client):
    res = client.post(
        "/api/copilot/roadmap",
        json={
            "current_role": "CS student",
            "target_role": "Data Scientist",
            "known_skills": ["python", "sql"],
            "weekly_hours": 10,
        },
    )
    assert res.status_code == 200
    body = res.json()
    assert body["target_role"] == "Data Scientist"
    assert body["source"] in ("openai", "template")
    assert len(body["weeks"]) > 0
    for week in body["weeks"]:
        assert week["tasks"]
        assert week["milestone"]


def test_roadmap_requires_target_role(client):
    res = client.post("/api/copilot/roadmap", json={"known_skills": []})
    assert res.status_code == 422


def test_roadmap_defaults_weekly_hours(client):
    res = client.post("/api/copilot/roadmap", json={"target_role": "Product Manager"})
    assert res.status_code == 200


def test_roadmap_history_empty_when_unauthenticated(client):
    res = client.get("/api/copilot/roadmap/history")
    assert res.status_code == 200
    assert res.json()["roadmaps"] == []


def test_roadmap_is_saved_to_history_when_authenticated(client, auth_headers):
    client.post(
        "/api/copilot/roadmap",
        json={"target_role": "DevOps Engineer", "known_skills": ["linux"]},
        headers=auth_headers,
    )
    res = client.get("/api/copilot/roadmap/history", headers=auth_headers)
    assert res.status_code == 200
    roadmaps = res.json()["roadmaps"]
    assert len(roadmaps) >= 1
    assert roadmaps[0]["target_role"] == "DevOps Engineer"
