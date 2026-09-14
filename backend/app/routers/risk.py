"""AI Job Risk Assessment endpoints."""
from fastapi import APIRouter

from app.models.schemas import RiskOut, RiskRequest
from app.services.risk_service import get_risk_model

router = APIRouter(prefix="/api/risk", tags=["risk"])


@router.post("/assess", response_model=RiskOut)
def assess(payload: RiskRequest):
    model = get_risk_model()
    return model.predict(payload.job_title, payload.job_description)
