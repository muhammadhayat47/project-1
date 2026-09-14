"""Dashboard summary endpoint — aggregates a snapshot across modules for the home screen."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import db_models
from app.security import get_current_user_optional

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary")
def summary(
    current_user: db_models.User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    if not current_user:
        return {
            "signed_in": False,
            "resumes_uploaded": 0,
            "roadmaps_generated": 0,
            "applications_in_queue": 0,
            "applications_applied": 0,
            "latest_roadmap_role": None,
        }

    resumes = db.query(db_models.ResumeProfile).filter(db_models.ResumeProfile.owner_id == current_user.id).count()
    roadmaps = (
        db.query(db_models.SavedRoadmap)
        .filter(db_models.SavedRoadmap.owner_id == current_user.id)
        .order_by(db_models.SavedRoadmap.created_at.desc())
        .all()
    )
    applications = db.query(db_models.ApplicationLog).filter(db_models.ApplicationLog.owner_id == current_user.id).all()
    applied_count = sum(1 for a in applications if a.status == "applied")

    return {
        "signed_in": True,
        "full_name": current_user.full_name,
        "target_role": current_user.target_role,
        "resumes_uploaded": resumes,
        "roadmaps_generated": len(roadmaps),
        "applications_in_queue": len(applications) - applied_count,
        "applications_applied": applied_count,
        "latest_roadmap_role": roadmaps[0].target_role if roadmaps else None,
    }
