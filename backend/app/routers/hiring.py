"""Predictive Hiring Analytics endpoints."""
from fastapi import APIRouter, Query

from app.models.schemas import HiringForecastOut
from app.services.forecasting_service import forecast_hiring
from app.utils.taxonomy import JOB_TITLES

router = APIRouter(prefix="/api/hiring", tags=["hiring"])


@router.get("/forecast", response_model=HiringForecastOut)
def get_forecast(
    role: str = Query(default="Software Engineer"),
    location: str = Query(default="Global"),
    horizon: int = Query(default=6, ge=1, le=12),
):
    return forecast_hiring(role=role, location=location, horizon=horizon)


@router.get("/roles")
def list_roles():
    return {"roles": JOB_TITLES}
