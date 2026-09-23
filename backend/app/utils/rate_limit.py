"""
A minimal, dependency-free sliding-window rate limiter.

For login/register-style endpoints this is enough to stop naive brute-force
and credential-stuffing scripts without pulling in an external package or
a Redis dependency. State is kept in-process (per worker), which is the
right trade-off for a single-instance deployment; for a multi-worker /
multi-instance production deployment, swap the in-memory dict for a Redis-
backed counter (e.g. via `slowapi` + Redis) using the same interface.
"""
from __future__ import annotations

import time
from collections import defaultdict

from fastapi import HTTPException, Request, status

# client_key -> list of unix timestamps of recent requests
_HITS: dict[str, list[float]] = defaultdict(list)


def _client_key(request: Request, bucket: str) -> str:
    client_ip = request.client.host if request.client else "unknown"
    return f"{bucket}:{client_ip}"


def rate_limit(bucket: str, *, max_requests: int, window_seconds: int):
    """Returns a FastAPI dependency that allows at most `max_requests` calls
    per `window_seconds` per client IP, per `bucket` (e.g. "login")."""

    def _dependency(request: Request) -> None:
        key = _client_key(request, bucket)
        now = time.time()
        window_start = now - window_seconds

        hits = _HITS[key]
        # Drop timestamps outside the current window.
        while hits and hits[0] < window_start:
            hits.pop(0)

        if len(hits) >= max_requests:
            retry_after = int(window_seconds - (now - hits[0])) + 1
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many attempts. Please try again in {retry_after}s.",
                headers={"Retry-After": str(retry_after)},
            )

        hits.append(now)

    return _dependency
