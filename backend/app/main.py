"""CareerOS API entrypoint."""
import logging

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.config import get_settings
from app.database import init_db
from app.routers import auth, autoapply, copilot, dashboard, hiring, risk, salary, skillgap

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("careeros")

settings = get_settings()

app = FastAPI(
    title="CareerOS API",
    description="AI Career Operating System — predictive hiring analytics, salary mapping, "
                "an AI career copilot, skill-gap analysis, AI job-risk scoring, and an "
                "autonomous job-application agent.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Turn Pydantic's verbose validation errors into a single readable message."""
    first = exc.errors()[0] if exc.errors() else None
    detail = "Invalid request."
    if first:
        field = ".".join(str(p) for p in first.get("loc", []) if p != "body")
        msg = first.get("msg", "Invalid value")
        detail = f"{field}: {msg}" if field else msg
    return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content={"detail": detail})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Never leak a raw stack trace to the client — log it, return a clean message."""
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Something went wrong on our end. Please try again."},
    )


@app.on_event("startup")
def on_startup():
    init_db()
    logger.info(
        "CareerOS API ready — AI features: %s | live job data: %s",
        "enabled" if settings.ai_enabled else "template fallback",
        "enabled" if settings.live_jobs_enabled else "demo dataset",
    )


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "ai_enabled": settings.ai_enabled,
        "live_jobs_enabled": settings.live_jobs_enabled,
    }


app.include_router(auth.router)
app.include_router(hiring.router)
app.include_router(salary.router)
app.include_router(copilot.router)
app.include_router(skillgap.router)
app.include_router(risk.router)
app.include_router(autoapply.router)
app.include_router(dashboard.router)
