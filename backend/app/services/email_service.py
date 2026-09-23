"""
Minimal transactional email sender using Python's stdlib smtplib — no extra
dependency required. If SMTP isn't configured (the zero-config default),
falls back to logging the message server-side so the whole flow (password
reset, etc.) stays testable without needing a mail provider.
"""
from __future__ import annotations

import logging
import smtplib
from email.mime.text import MIMEText

from app.config import get_settings

logger = logging.getLogger("careeros.email")
settings = get_settings()


def send_email(to_email: str, subject: str, body: str) -> bool:
    """Returns True if actually sent via SMTP, False if it just logged."""
    if not settings.email_enabled:
        logger.info("[demo mode — no SMTP configured] Email to %s | Subject: %s\n%s", to_email, subject, body)
        return False

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM_EMAIL
    msg["To"] = to_email

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM_EMAIL, [to_email], msg.as_string())
        return True
    except Exception:
        logger.exception("Failed to send email to %s", to_email)
        return False
