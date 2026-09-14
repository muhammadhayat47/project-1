"""Tests for /api/autoapply — job matching, cover-letter drafting, and the queue."""

SAMPLE_RESUME = "Experienced Python developer with SQL, Docker, and AWS background."


def test_match_returns_ranked_jobs(client):
    res = client.post(
        "/api/autoapply/match",
        json={"resume_text": SAMPLE_RESUME, "target_role": "Backend Developer", "max_results": 5},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["query_role"] == "Backend Developer"
    assert len(body["jobs"]) <= 5
    # Results should be sorted by match score, descending.
    scores = [j["match_score_pct"] for j in body["jobs"] if j["match_score_pct"] is not None]
    assert scores == sorted(scores, reverse=True)


def test_match_remote_only_filters_results(client):
    res = client.post(
        "/api/autoapply/match",
        json={"resume_text": SAMPLE_RESUME, "target_role": "Backend Developer", "remote_only": True, "max_results": 20},
    )
    body = res.json()
    assert all(job["remote"] for job in body["jobs"])


def test_draft_generates_cover_letter(client):
    match_res = client.post(
        "/api/autoapply/match",
        json={"resume_text": SAMPLE_RESUME, "target_role": "Backend Developer", "max_results": 1},
    )
    job = match_res.json()["jobs"][0]

    draft_res = client.post(
        "/api/autoapply/draft",
        json={"job": job, "resume_text": SAMPLE_RESUME, "tone": "professional"},
    )
    assert draft_res.status_code == 200
    body = draft_res.json()
    assert body["cover_letter"]
    assert body["source"] in ("openai", "template")
    assert isinstance(body["resume_bullet_suggestions"], list)


def test_queue_requires_authentication(client):
    res = client.get("/api/autoapply/queue")
    assert res.status_code in (401, 403)


def test_draft_then_queue_then_update_status(client, auth_headers):
    match_res = client.post(
        "/api/autoapply/match",
        json={"resume_text": SAMPLE_RESUME, "target_role": "Backend Developer", "max_results": 1},
        headers=auth_headers,
    )
    job = match_res.json()["jobs"][0]

    client.post(
        "/api/autoapply/draft",
        json={"job": job, "resume_text": SAMPLE_RESUME, "tone": "concise"},
        headers=auth_headers,
    )

    queue_res = client.get("/api/autoapply/queue", headers=auth_headers)
    assert queue_res.status_code == 200
    queue = queue_res.json()["queue"]
    assert len(queue) >= 1

    item_id = queue[0]["id"]
    update_res = client.patch(
        f"/api/autoapply/queue/{item_id}",
        params={"status_value": "applied"},
        headers=auth_headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "applied"


def test_update_queue_item_rejects_invalid_status(client, auth_headers):
    res = client.patch(
        "/api/autoapply/queue/1",
        params={"status_value": "not-a-real-status"},
        headers=auth_headers,
    )
    assert res.status_code == 400


def test_update_nonexistent_queue_item_returns_404(client, auth_headers):
    res = client.patch(
        "/api/autoapply/queue/999999",
        params={"status_value": "applied"},
        headers=auth_headers,
    )
    assert res.status_code == 404
