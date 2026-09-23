"""Auth: register, login, current-user profile, password reset."""
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import db_models, schemas
from app.security import create_access_token, get_current_user, hash_password, verify_password
from app.services.email_service import send_email
from app.utils.rate_limit import rate_limit

router = APIRouter(prefix="/api/auth", tags=["auth"])
settings = get_settings()

# Register: 5 attempts per 10 minutes per IP. Login: 8 attempts per 5 minutes
# per IP — tight enough to blunt brute-force/credential-stuffing scripts,
# loose enough that a genuine user mistyping their password isn't locked out.
_register_limit = rate_limit("register", max_requests=5, window_seconds=600)
_login_limit = rate_limit("login", max_requests=8, window_seconds=300)
_forgot_password_limit = rate_limit("forgot-password", max_requests=5, window_seconds=900)
_reset_password_limit = rate_limit("reset-password", max_requests=10, window_seconds=900)

RESET_TOKEN_TTL_MINUTES = 30


@router.post("/register", response_model=schemas.TokenOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(_register_limit)])
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(db_models.User).filter(db_models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists. Try logging in instead.")

    user = db_models.User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.email)
    return schemas.TokenOut(access_token=token, user=schemas.UserOut.model_validate(user))


@router.post("/login", response_model=schemas.TokenOut, dependencies=[Depends(_login_limit)])
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(db_models.User).filter(db_models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    token = create_access_token(subject=user.email)
    return schemas.TokenOut(access_token=token, user=schemas.UserOut.model_validate(user))


@router.get("/me", response_model=schemas.UserOut)
def me(current_user: db_models.User = Depends(get_current_user)):
    return current_user


@router.post("/forgot-password", response_model=schemas.ForgotPasswordOut, dependencies=[Depends(_forgot_password_limit)])
def forgot_password(payload: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    generic_message = "If an account exists for that email, a reset link has been sent."
    user = db.query(db_models.User).filter(db_models.User.email == payload.email).first()

    # Always return the same generic message whether or not the account
    # exists, so this endpoint can't be used to enumerate registered emails.
    if not user:
        return schemas.ForgotPasswordOut(message=generic_message)

    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expires = datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_TTL_MINUTES)
    db.commit()

    reset_link = f"{settings.cors_origin_list[0] if settings.cors_origin_list else 'http://localhost:5173'}/reset-password?token={token}"
    sent = send_email(
        user.email,
        "Reset your CareerOS password",
        f"Hi {user.full_name},\n\nUse this link within {RESET_TOKEN_TTL_MINUTES} minutes to reset your password:\n{reset_link}\n\n"
        "If you didn't request this, you can safely ignore this email.",
    )

    debug_token = None if (sent or settings.ENVIRONMENT == "production") else token
    return schemas.ForgotPasswordOut(message=generic_message, debug_reset_token=debug_token)


@router.post("/reset-password", response_model=schemas.UserOut, dependencies=[Depends(_reset_password_limit)])
def reset_password(payload: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(db_models.User).filter(db_models.User.reset_token == payload.token).first()
    if not user or not user.reset_token_expires:
        raise HTTPException(status_code=400, detail="That reset link is invalid or has expired.")

    expires_at = user.reset_token_expires
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="That reset link is invalid or has expired.")

    user.hashed_password = hash_password(payload.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    db.refresh(user)
    return user


@router.patch("/me", response_model=schemas.UserOut)
def update_profile(
    target_role: str | None = None,
    target_location: str | None = None,
    current_user: db_models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if target_role is not None:
        current_user.target_role = target_role
    if target_location is not None:
        current_user.target_location = target_location
    db.commit()
    db.refresh(current_user)
    return current_user
