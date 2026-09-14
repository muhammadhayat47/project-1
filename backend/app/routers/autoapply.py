"""Autonomous Job Application Agent endpoints: match, draft, and track."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import db_models, schemas
from app.security import get_current_user, get_current_user_optional
from app.services.coverletter_service import generate_application
from app.services.job_service import find_matching_jobs

router = APIRouter(prefix="/api/autoapply", tags=["autoapply"])


@router.post("/match", response_model=schemas.JobMatchOut)
def match_jobs(payload: schemas.JobMatchRequest):
    return find_matching_jobs(
        resume_text=payload.resume_text,
        target_role=payload.target_role,
        target_location=payload.target_location,
        remote_only=payload.remote_only,
        max_results=payload.max_results,
    )


@router.post("/draft", response_model=schemas.ApplyOut)
def draft_application(
    payload: schemas.ApplyRequest,
    current_user: db_models.User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    result = generate_application(
        job_title=payload.job.title,
        company=payload.job.company,
        job_description=payload.job.description,
        resume_text=payload.resume_text,
        tone=payload.tone,
    )

    if current_user:
        log = db_models.ApplicationLog(
            owner_id=current_user.id,
            job_title=payload.job.title,
            company=payload.job.company,
            location=payload.job.location,
            match_score=payload.job.match_score_pct or 0.0,
            status="drafted",
            cover_letter=result["cover_letter"],
            apply_url=payload.job.apply_url,
        )
        db.add(log)
        db.commit()

    return result


@router.get("/queue")
def get_queue(current_user: db_models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.query(db_models.ApplicationLog)
        .filter(db_models.ApplicationLog.owner_id == current_user.id)
        .order_by(db_models.ApplicationLog.created_at.desc())
        .all()
    )
    return {
        "queue": [
            {
                "id": r.id,
                "job_title": r.job_title,
                "company": r.company,
                "location": r.location,
                "match_score": r.match_score,
                "status": r.status,
                "apply_url": r.apply_url,
                "created_at": r.created_at.isoformat(),
            }
            for r in rows
        ]
    }


@router.patch("/queue/{item_id}")
def update_queue_item(
    item_id: int,
    status_value: str,
    current_user: db_models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    allowed = {"queued", "drafted", "applied", "skipped"}
    if status_value not in allowed:
        raise HTTPException(status_code=400, detail=f"Status must be one of {sorted(allowed)}")

    item = (
        db.query(db_models.ApplicationLog)
        .filter(db_models.ApplicationLog.id == item_id, db_models.ApplicationLog.owner_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Application not found.")

    item.status = status_value
    db.commit()
    return {"id": item.id, "status": item.status}
