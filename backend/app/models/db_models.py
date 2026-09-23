"""SQLAlchemy ORM models — the persistent tables behind user accounts."""
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    target_role = Column(String(120), nullable=True)
    target_location = Column(String(120), nullable=True)
    reset_token = Column(String(64), nullable=True, index=True)
    reset_token_expires = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    resumes = relationship("ResumeProfile", back_populates="owner", cascade="all, delete-orphan")
    roadmaps = relationship("SavedRoadmap", back_populates="owner", cascade="all, delete-orphan")
    applications = relationship("ApplicationLog", back_populates="owner", cascade="all, delete-orphan")


class ResumeProfile(Base):
    __tablename__ = "resume_profiles"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    raw_text = Column(Text, nullable=False)
    extracted_skills = Column(Text, nullable=True)  # comma-separated
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="resumes")


class SavedRoadmap(Base):
    __tablename__ = "saved_roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_role = Column(String(120), nullable=False)
    content_json = Column(Text, nullable=False)
    source = Column(String(20), default="template")  # "template" | "openai"
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="roadmaps")


class ApplicationLog(Base):
    __tablename__ = "application_log"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_title = Column(String(200), nullable=False)
    company = Column(String(200), nullable=False)
    location = Column(String(200), nullable=True)
    match_score = Column(Float, nullable=False)
    status = Column(String(30), default="queued")  # queued | drafted | applied | skipped
    cover_letter = Column(Text, nullable=True)
    apply_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="applications")
