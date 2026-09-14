"""Global Salary Mapping endpoints."""
from fastapi import APIRouter, Query

from app.models.schemas import SalaryMapOut
from app.services.salary_service import get_salary_map

router = APIRouter(prefix="/api/salary", tags=["salary"])


@router.get("/map", response_model=SalaryMapOut)
def salary_map(role: str = Query(default="Software Engineer")):
    return get_salary_map(role)
