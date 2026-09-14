"""Skill Gap Analyzer endpoints."""
from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import db_models, schemas
from app.security import get_current_user_optional
from app.services.resume_parser import extract_text
from app.services.skill_matcher import analyze_gap, extract_skills

router = APIRouter(prefix="/api/skillgap", tags=["skillgap"])


@router.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: db_models.User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    text = await extract_text(file)
    skills = sorted(extract_skills(text))

    if current_user:
        record = db_models.ResumeProfile(
            owner_id=current_user.id,
            filename=file.filename or "resume",
            raw_text=text,
            extracted_skills=",".join(skills),
        )
        db.add(record)
        db.commit()

    return {"resume_text": text, "extracted_skills": skills, "word_count": len(text.split())}


@router.post("/analyze", response_model=schemas.SkillGapOut)
def analyze(payload: schemas.SkillGapRequest):
    return analyze_gap(payload.resume_text, payload.job_description)
