"""
Predictive Hiring Analytics module.

Implements the "time-series ML model to predict company hiring trends"
objective from the proposal: trend extraction via linear regression plus a
12-month seasonal profile (a lightweight, dependency-free stand-in for
Prophet that needs nothing beyond numpy/scikit-learn, which is why it can
run anywhere without a heavy install). Swap in `prophet` or `statsmodels`
here later without touching the API layer if you want a heavier model.
"""
from __future__ import annotations

from datetime import date

import numpy as np
from sklearn.linear_model import LinearRegression

from app.services.seed_data import hiring_history_for_role, top_hiring_companies_for_role

PERIOD = 12


def _month_labels(n_back: int, n_forward: int) -> tuple[list[str], list[str]]:
    today = date.today().replace(day=1)
    history_labels = []
    for i in range(n_back, 0, -1):
        m = today.month - i
        y = today.year
        while m <= 0:
            m += 12
            y -= 1
        history_labels.append(f"{y}-{m:02d}")
    forecast_labels = []
    m, y = today.month, today.year
    for i in range(n_forward):
        mm = m + i
        yy = y
        while mm > 12:
            mm -= 12
            yy += 1
        forecast_labels.append(f"{yy}-{mm:02d}")
    return history_labels, forecast_labels


def forecast_hiring(role: str, location: str = "Global", horizon: int = 6) -> dict:
    history = np.array(hiring_history_for_role(role, location))
    n = len(history)
    t = np.arange(n).reshape(-1, 1)

    lr = LinearRegression().fit(t, history)
    trend_pred = lr.predict(t)
    detrended = history - trend_pred

    seasonal_profile = np.array([
        detrended[i::PERIOD].mean() if len(detrended[i::PERIOD]) else 0.0
        for i in range(PERIOD)
    ])
    seasonal_profile -= seasonal_profile.mean()

    reconstructed = trend_pred + np.tile(seasonal_profile, n // PERIOD + 1)[:n]
    resid_std = float((history - reconstructed).std())

    future_t = np.arange(n, n + horizon).reshape(-1, 1)
    future_trend = lr.predict(future_t)
    future_seasonal = np.array([seasonal_profile[(n + i) % PERIOD] for i in range(horizon)])
    point = np.clip(future_trend + future_seasonal, 0, None)
    lower = np.clip(point - 1.28 * resid_std, 0, None)
    upper = point + 1.28 * resid_std

    slope = float(lr.coef_[0])
    base_level = max(float(history[-6:].mean()), 1.0)
    growth_rate_pct = round((slope / base_level) * 100, 2)

    if growth_rate_pct > 1.5:
        momentum = "Accelerating"
    elif growth_rate_pct < -1.0:
        momentum = "Cooling"
    else:
        momentum = "Stable"

    hist_labels, fwd_labels = _month_labels(n, horizon)

    return {
        "role": role,
        "location": location,
        "history": [
            {"period": lbl, "value": round(float(v), 1), "lower": round(float(v), 1), "upper": round(float(v), 1)}
            for lbl, v in zip(hist_labels, history)
        ],
        "forecast": [
            {"period": lbl, "value": round(float(p), 1), "lower": round(float(lo), 1), "upper": round(float(hi), 1)}
            for lbl, p, lo, hi in zip(fwd_labels, point, lower, upper)
        ],
        "monthly_growth_rate_pct": growth_rate_pct,
        "hiring_momentum": momentum,
        "top_hiring_companies": top_hiring_companies_for_role(role, location),
    }
