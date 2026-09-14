"""Tests for /api/skillgap — resume/JD match analysis (pasted-text path)."""

SAMPLE_RESUME = """
Jane Doe — Software Engineer
Skills: Python, SQL, React, Docker, AWS, Git, REST APIs
Built and maintained backend services in Python and FastAPI.
"""

SAMPLE_JD = """
We are looking for a Backend Engineer with strong Python, SQL, and Docker
experience. Familiarity with Kubernetes and AWS is a plus.
"""


def test_analyze_returns_match_score_and_skill_lists(client):
    res = client.post(
        "/api/skillgap/analyze",
        json={"resume_text": SAMPLE_RESUME, "job_description": SAMPLE_JD},
    )
    assert res.status_code == 200
    body = res.json()
    assert 0 <= body["match_score_pct"] <= 100
    assert isinstance(body["matched_skills"], list)
    assert isinstance(body["missing_skills"], list)
    # Python and SQL appear in both resume and JD — they should be matched, not missing.
    matched_lower = [s.lower() for s in body["matched_skills"]]
    assert "python" in matched_lower


def test_analyze_rejects_missing_fields(client):
    res = client.post("/api/skillgap/analyze", json={"resume_text": "just a resume"})
    assert res.status_code == 422


def test_analyze_handles_empty_job_description_gracefully(client):
    res = client.post(
        "/api/skillgap/analyze",
        json={"resume_text": SAMPLE_RESUME, "job_description": ""},
    )
    assert res.status_code == 200
