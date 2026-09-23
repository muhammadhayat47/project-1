# Deploying CareerOS

This project is deployment-ready as-is (both `backend/Dockerfile` and
`frontend/Dockerfile` already exist, plus `docker-compose.yml` for local
multi-container runs). This guide covers three practical paths, from
easiest to most control.

## Option 1 — Render.com (easiest, free tier)

A ready-made blueprint (`render.yaml`) is included at the project root.

1. Push this repo to GitHub (already done if you're reading this from there).
2. Go to https://dashboard.render.com/blueprints → **New Blueprint Instance**.
3. Connect this GitHub repo. Render will read `render.yaml` and create:
   - `careeros-backend` — a Docker web service (FastAPI/uvicorn) with a
     persistent 1GB disk for the SQLite database.
   - `careeros-frontend` — a static site built from the Vite production build.
4. Render will prompt for the "secret" env vars (`OPENAI_API_KEY`,
   `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`) — leave them blank to run in demo
   mode, or paste your keys for live AI / live jobs.
5. Once both services are live, open `careeros-backend`'s settings and
   update `CORS_ORIGINS` to the actual frontend URL Render assigned (it's
   pre-filled with the default naming pattern, but confirm it matches).
6. Done — the frontend URL is your live app.

## Option 2 — Docker Compose on any VPS (Hetzner, DigitalOcean, AWS EC2, etc.)

The existing `docker-compose.yml` already wires backend + frontend + a
persistent volume for the SQLite file.

1. Provision a small VPS (1-2GB RAM is enough) and install Docker + Docker Compose.
2. Copy this repo to the server (`git clone <your-repo-url>`).
3. Create `backend/.env` from `backend/.env.example` with real values —
   at minimum a strong `SECRET_KEY`, and `CORS_ORIGINS` set to your domain.
4. Run:
   ```
   docker compose up -d --build
   ```
5. Put a reverse proxy (Caddy or Nginx) in front for HTTPS — Caddy is the
   simplest:
   ```
   your-domain.com {
       reverse_proxy /api/* localhost:8000
       reverse_proxy localhost:80
   }
   ```
6. Point your domain's DNS A record at the VPS IP.

## Option 3 — Split hosting (Vercel/Netlify for frontend + Railway/Fly.io for backend)

- **Frontend**: import the repo into Vercel or Netlify, set the build
  command to `cd frontend && npm run build`, publish directory
  `frontend/dist`, and set `VITE_API_BASE_URL` to your backend's URL.
- **Backend**: deploy `backend/Dockerfile` to Railway or Fly.io the same
  way as Option 1 — set `SECRET_KEY`, `CORS_ORIGINS`, and optionally
  `OPENAI_API_KEY` / `ADZUNA_APP_ID` / `ADZUNA_APP_KEY` as secrets.

## Before going live, regardless of platform

- [ ] Set a real, random `SECRET_KEY` (never the `dev-only-insecure-key` default).
- [ ] Set `CORS_ORIGINS` to your actual frontend domain(s) only.
- [ ] Set `ENVIRONMENT=production`.
- [ ] Decide whether SQLite is enough for your expected traffic, or
      switch `DATABASE_URL` to a managed Postgres instance (SQLAlchemy
      makes this a one-line config change — no code changes needed).
- [ ] Add your real `OPENAI_API_KEY` / `ADZUNA_APP_ID` + `ADZUNA_APP_KEY`
      if you want live AI roadmaps and live job listings instead of demo mode.
