"""
Thin OpenAI wrapper. Every caller treats this as best-effort: if no API key
is configured, or the call fails for any reason (offline, quota, bad key),
`generate()` returns None and the caller falls back to its own
template-based generator. This is what keeps the whole app fully
functional with zero configuration, per the proposal's "AI layer" (GPT-4o)
being additive rather than load-bearing.
"""
from __future__ import annotations

from app.config import get_settings

settings = get_settings()


def generate(system_prompt: str, user_prompt: str, max_tokens: int = 900) -> str | None:
    if not settings.ai_enabled:
        return None
    try:
        from openai import OpenAI

        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=max_tokens,
            temperature=0.7,
        )
        return response.choices[0].message.content
    except Exception:
        # Network issue, bad key, quota exceeded, etc. — degrade gracefully.
        return None
