"""Tests for /api/hiring — forecast + role list."""


def test_list_roles_returns_nonempty_list(client):
    res = client.get("/api/hiring/roles")
    assert res.status_code == 200
    assert isinstance(res.json()["roles"], list)
    assert len(res.json()["roles"]) > 0


def test_forecast_default_params(client):
    res = client.get("/api/hiring/forecast")
    assert res.status_code == 200
    body = res.json()
    assert "history" in body
    assert "forecast" in body
    assert len(body["history"]) > 0
    assert len(body["forecast"]) > 0


def test_forecast_respects_horizon(client):
    res = client.get("/api/hiring/forecast", params={"role": "Data Scientist", "horizon": 3})
    assert res.status_code == 200
    assert len(res.json()["forecast"]) == 3


def test_forecast_rejects_out_of_range_horizon(client):
    res = client.get("/api/hiring/forecast", params={"horizon": 99})
    assert res.status_code == 422


def test_forecast_is_deterministic_for_same_inputs(client):
    """Same role/location/horizon should always produce the same numbers —
    this keeps demos and screenshots reproducible across restarts."""
    params = {"role": "Product Manager", "location": "United States", "horizon": 4}
    first = client.get("/api/hiring/forecast", params=params).json()
    second = client.get("/api/hiring/forecast", params=params).json()
    assert first["forecast"] == second["forecast"]
