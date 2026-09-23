"""Pydantic request/response schemas shared across routers."""
import re
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


# ---- Auth -------------------------------------------------------------
class UserCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Za-z]", v) or not re.search(r"\d", v):
            raise ValueError("Password must contain at least one letter and one number.")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordOut(BaseModel):
    message: str
    # Only populated outside production (no SMTP configured) so the reset
    # flow stays testable without a mail provider. Never sent in prod.
    debug_reset_token: str | None = None


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Za-z]", v) or not re.search(r"\d", v):
            raise ValueError("Password must contain at least one letter and one number.")
        return v


class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    target_role: str | None = None
    target_location: str | None = None

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---- Hiring analytics ---------------------------------------------------
class ForecastPoint(BaseModel):
    period: str
    value: float
    lower: float
    upper: float


class HiringForecastOut(BaseModel):
    role: str
    location: str
    history: list[ForecastPoint]
    forecast: list[ForecastPoint]
    monthly_growth_rate_pct: float
    hiring_momentum: str  # "Accelerating" | "Stable" | "Cooling"
    top_hiring_companies: list[dict]


# ---- Salary map ---------------------------------------------------------
class SalaryPoint(BaseModel):
    country: str
    country_code: str
    lat: float
    lon: float
    median_salary_usd: float
    remote_share_pct: float
    demand_index: float


class SalaryMapOut(BaseModel):
    role: str
    currency: str
    points: list[SalaryPoint]
    global_median_usd: float


# ---- Skill gap ------------------------------------------------------------
class SkillGapRequest(BaseModel):
    resume_text: str
    job_description: str


class SkillGapOut(BaseModel):
    match_score_pct: float
    matched_skills: list[str]
    missing_skills: list[str]
    resume_skill_count: int
    jd_skill_count: int
    recommended_courses: list[dict]


# ---- Risk assessment ------------------------------------------------------
class RiskRequest(BaseModel):
    job_title: str
    job_description: str | None = None


class RiskOut(BaseModel):
    job_title: str
    risk_level: str  # Low | Medium | High
    risk_score_pct: float
    probability_breakdown: dict
    drivers: list[str]
    resilience_tips: list[str]


# ---- Career copilot ---------------------------------------------------
class RoadmapRequest(BaseModel):
    current_role: str | None = None
    target_role: str
    known_skills: list[str] = []
    weekly_hours: int = Field(default=8, ge=1, le=60)


class RoadmapWeek(BaseModel):
    week_range: str
    focus: str
    tasks: list[str]
    milestone: str


class RoadmapOut(BaseModel):
    target_role: str
    source: str  # "openai" | "template"
    summary: str
    weeks: list[RoadmapWeek]


# ---- Auto-apply agent ---------------------------------------------------
class JobListing(BaseModel):
    id: str
    title: str
    company: str
    location: str
    remote: bool
    salary_usd: float | None
    description: str
    apply_url: str
    posted_days_ago: int
    match_score_pct: float | None = None


class JobMatchRequest(BaseModel):
    resume_text: str
    target_role: str
    target_location: str | None = None
    remote_only: bool = False
    max_results: int = Field(default=12, ge=1, le=50)


class JobMatchOut(BaseModel):
    query_role: str
    total_considered: int
    jobs: list[JobListing]


class ApplyRequest(BaseModel):
    job: JobListing
    resume_text: str
    tone: str = "professional"  # professional | enthusiastic | concise


class ApplyOut(BaseModel):
    job_title: str
    company: str
    cover_letter: str
    source: str  # "openai" | "template"
    resume_bullet_suggestions: list[str]
