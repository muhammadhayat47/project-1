"""Tests for /api/salary — global salary map."""


def test_salary_map_returns_points_for_default_role(client):
    res = client.get("/api/salary/map")
    assert res.status_code == 200
    body = res.json()
    assert len(body["points"]) > 0
    assert "global_median_usd" in body


def test_salary_map_points_have_expected_fields(client):
    res = client.get("/api/salary/map", params={"role": "Backend Developer"})
    assert res.status_code == 200
    point = res.json()["points"][0]
    for field in ("country", "country_code", "median_salary_usd", "remote_share_pct", "demand_index", "lat", "lon"):
        assert field in point


def test_salary_map_is_deterministic_for_same_role(client):
    first = client.get("/api/salary/map", params={"role": "UX Designer"}).json()
    second = client.get("/api/salary/map", params={"role": "UX Designer"}).json()
    assert first == second
