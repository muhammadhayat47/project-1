"""AI Career Copilot endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import db_models, schemas
from app.security import get_current_user_optional
from app.services.roadmap_service import generate_roadmap
import json

router = APIRouter(prefix="/api/copilot", tags=["copilot"])


@router.post("/roadmap", response_model=schemas.RoadmapOut)
def roadmap(
    payload: schemas.RoadmapRequest,
    current_user: db_models.User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    result = generate_roadmap(
        current_role=payload.current_role,
        target_role=payload.target_role,
        known_skills=payload.known_skills,
        weekly_hours=payload.weekly_hours,
    )

    if current_user:
        record = db_models.SavedRoadmap(
            owner_id=current_user.id,
            target_role=payload.target_role,
            content_json=json.dumps(result),
            source=result["source"],
        )
        db.add(record)
        db.commit()

    return result


@router.get("/roadmap/history")
def roadmap_history(
    current_user: db_models.User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    if not current_user:
        return {"roadmaps": []}
    records = (
        db.query(db_models.SavedRoadmap)
        .filter(db_models.SavedRoadmap.owner_id == current_user.id)
        .order_by(db_models.SavedRoadmap.created_at.desc())
        .limit(10)
        .all()
    )
    return {
        "roadmaps": [
            {
                "id": r.id,
                "target_role": r.target_role,
                "source": r.source,
                "created_at": r.created_at.isoformat(),
                "content": json.loads(r.content_json),
            }
            for r in records
        ]
    }
