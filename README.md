# CareerOS — AI Career Operating System

Predictive AI for workforce intelligence and autonomous job applications.

Final year BS (Computer Science) project — Government Post Graduate College, Landikota, Khyber, affiliated with the University of Peshawar (Session 2022–2026).
Submitted by **Muhammad Hayat (222811)**.

---

## What it is

CareerOS is a full-stack, AI-powered career intelligence platform that combines six modules into a single "operating system" for a job search:

| # | Module | What it does |
|---|--------|--------------|
| 1 | **Predictive Hiring Analytics** | Forecasts hiring volume for any role/location 1–12 months out, using trend + seasonal decomposition over 24 months of history. |
| 2 | **Global Salary Mapping** | Interactive world map of median salary, remote share, and demand index for any role across 15 countries. |
| 3 | **AI Career Copilot** | Generates a personalized 90-day learning roadmap (GPT-4o if configured, otherwise a rule-based generator built from a curated skills taxonomy). |
| 4 | **Skill Gap Analyzer** | Parses an uploaded resume (PDF/DOCX/TXT), extracts skills, and compares them against a job description with a TF-IDF + taxonomy match score. |
| 5 | **AI Job Risk Assessment** | A RandomForest classifier estimates a role's AI-automation exposure (Low/Medium/High) with concrete drivers and resilience tips. |
| 6 | **Autonomous Job Application Agent** | Matches a resume against job listings, ranks by fit, and auto-drafts a tailored cover letter + resume bullet suggestions per job. |

Everything runs **fully functional with zero external accounts** — every AI-powered feature has a genuinely useful rule-based/statistical fallback, and upgrades automatically to GPT-4o / live job data if you add your own API keys.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Recharts, react-simple-maps |
| Backend | Python, FastAPI, SQLAlchemy, Pydantic |
| Auth | JWT (python-jose) + bcrypt password hashing |
| Database | SQLite (default) — swappable to Postgres via `DATABASE_URL` |
| ML / Data | scikit-learn (LinearRegression, RandomForestClassifier, TF-IDF), pandas, numpy |
| Resume parsing | pdfplumber, python-docx |
| Optional AI | OpenAI API (GPT-4o) |
| Optional live jobs | Adzuna Jobs API |
| Testing | pytest + httpx (backend, 40+ tests across every module) |
| Deployment | Docker + docker-compose (nginx-served frontend, proxied API) |

---

## Project structure

```
project/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app + router wiring + global error handlers
│   │   ├── config.py            # Settings (env-driven, safe defaults)
│   │   ├── database.py          # SQLAlchemy session/engine
│   │   ├── security.py          # JWT + password hashing
│   │   ├── models/
│   │   │   ├── db_models.py     # ORM tables (User, ResumeProfile, SavedRoadmap, ApplicationLog)
│   │   │   └── schemas.py       # Pydantic request/response schemas
│   │   ├── routers/             # One router per module (auth, hiring, salary, copilot, skillgap, risk, autoapply, dashboard)
│   │   ├── services/            # Business logic + ML for each module
│   │   └── utils/taxonomy.py    # Skills taxonomy + course catalog
│   ├── tests/                   # pytest suite — one file per module, isolated in-memory DB
│   ├── requirements.txt
│   ├── run.py                   # `python run.py` — dev server with auto-reload
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/               # One page per module + Landing/Login/Register
│   │   ├── components/
│   │   │   ├── layout/          # Sidebar (desktop + mobile drawer), Topbar, AppLayout
│   │   │   └── ui/              # Reusable UI primitives (Button, Card, Badge, GaugeChart, ErrorBoundary, ...)
│   │   ├── context/              # AuthContext, ResumeContext, ToastContext
│   │   ├── hooks/                # useDocumentTitle, useDebounce, useLocalStorage, useMediaQuery
│   │   ├── api/client.js         # Axios instance with auth interceptor
│   │   └── utils/                # Client-side export helpers (roadmap/cover-letter download)
│   ├── public/                   # favicon, manifest, robots.txt
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env.example
├── docker-compose.yml
└── README.md
```

---

## Getting started (local, without Docker)

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env        # Windows
# cp .env.example .env        # macOS / Linux

python run.py
```

The API starts at **http://127.0.0.1:8000** (interactive docs at `/docs`, health check at `/api/health`). The SQLite database (`careeros.db`) and its tables are created automatically on first run.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The app starts at **http://localhost:5173** and proxies `/api/*` requests to the backend automatically (see `vite.config.js`).

### 3. Open the app

Visit `http://localhost:5173`. You can explore every module immediately in demo mode — create a free account to save your resume, roadmaps, and application queue across sessions.

---

## Getting started (Docker)

With Docker Desktop installed:

```bash
docker compose up --build
```

- Frontend (nginx, proxies `/api` to the backend container): **http://localhost**
- Backend API: **http://localhost:8000**

SQLite data persists in a named volume (`careeros-data`) across container restarts. To enable GPT-4o or live job listings, uncomment and fill in the relevant environment variables in `docker-compose.yml` before running.

---

## Running the tests

```bash
cd backend
pip install -r requirements.txt   # includes pytest + httpx
pytest
```

The suite spins up an isolated in-memory SQLite database per run (never touches `careeros.db`) and covers registration/login, every module's core endpoint, deterministic-output guarantees, and authorization checks (e.g. the application queue requires a logged-in user).

---

## Optional: unlock live AI and live job data

CareerOS works completely out of the box. Add either of these to `backend/.env` to upgrade specific features:

```env
# Richer Career Copilot roadmaps + cover letters (GPT-4o instead of the built-in template engine)
OPENAI_API_KEY=sk-...

# Real job listings in Auto-Apply instead of the bundled realistic sample dataset
ADZUNA_APP_ID=...
ADZUNA_APP_KEY=...
```

Get a free Adzuna developer key at https://developer.adzuna.com.

---

## Design notes

- **Every "AI" feature degrades gracefully.** If no `OPENAI_API_KEY` is set, the Career Copilot and cover-letter generator fall back to a deterministic, still-personalized template engine — the app never shows a broken or empty state for lack of a key.
- **Auto-Apply never automates actual submissions.** It matches, ranks, and drafts — the person reviews and clicks through to apply manually. This is a deliberate choice: automated login/submission against LinkedIn/Indeed/Glassdoor violates their terms of service.
- **All synthetic data is deterministic**, seeded from a hash of the query parameters (role, location, country). The same role always produces the same forecast/salary numbers across restarts, which keeps demos and screenshots reproducible.
- **The frontend never crashes to a blank screen.** A top-level error boundary catches render errors and shows a recovery screen instead, and a toast notification system surfaces every API error inline without blocking the rest of the page.
- **Mobile-first navigation.** The sidebar collapses into a slide-out drawer under the `md` breakpoint, and every page/table is usable down to phone widths.

---

## Roadmap / future work

Carried over from the project proposal's future-work section:

- AI mock interview simulator with voice input and feedback
- Company-side recruiter dashboard
- Native mobile app (iOS/Android)
- Blockchain-verified certificate integration
- True PDF export for the generated roadmap and cover letters (currently exports as a clean `.txt` file — no extra dependencies required to run the project)
- Frontend test suite (Vitest + React Testing Library) to complement the existing backend pytest coverage

---

## License

Academic project — Government Post Graduate College, Landikota, Khyber, affiliated with University of Peshawar. Not licensed for commercial redistribution.
