"""
AI Career Copilot module — generates a personalized 90-day learning roadmap.

Tries GPT-4o first (if OPENAI_API_KEY is set) for a nuanced, freeform plan.
Otherwise falls back to a deterministic template generator built from a
curated role -> core-skills map, which still personalizes on the skills the
user already has, so the fallback is a genuinely useful roadmap, not a
placeholder.
"""
from __future__ import annotations

import json
import re

from app.services import ai_client

ROLE_SKILL_MAP: dict[str, list[str]] = {
    "software engineer": ["git", "python", "sql", "rest api", "docker", "ci/cd", "problem solving"],
    "frontend developer": ["html", "css", "javascript", "react", "typescript", "git", "figma"],
    "backend developer": ["python", "sql", "rest api", "docker", "postgresql", "fastapi", "git"],
    "full stack developer": ["javascript", "react", "node.js", "sql", "rest api", "git", "docker"],
    "data scientist": ["python", "pandas", "numpy", "statistics", "machine learning", "sql", "data visualization"],
    "data analyst": ["sql", "excel", "power bi", "data analysis", "statistics", "data visualization"],
    "machine learning engineer": ["python", "machine learning", "deep learning", "pytorch", "docker", "sql", "statistics"],
    "ai engineer": ["python", "llm", "prompt engineering", "machine learning", "rest api", "docker"],
    "devops engineer": ["docker", "kubernetes", "ci/cd", "aws", "terraform", "git", "python"],
    "cloud engineer": ["aws", "azure", "gcp", "terraform", "docker", "kubernetes", "ci/cd"],
    "product manager": ["project management", "agile", "stakeholder management", "data analysis", "communication", "user research"],
    "project manager": ["project management", "agile", "scrum", "stakeholder management", "communication", "excel"],
    "ui/ux designer": ["figma", "ui/ux design", "wireframing", "user research", "adobe xd", "communication"],
    "qa engineer": ["sql", "git", "rest api", "problem solving", "agile", "python"],
    "business analyst": ["sql", "excel", "data analysis", "stakeholder management", "communication", "power bi"],
    "digital marketing specialist": ["seo", "content marketing", "google analytics", "communication", "data analysis"],
    "financial analyst": ["excel", "financial modeling", "statistics", "data analysis", "communication"],
    "hr generalist": ["communication", "stakeholder management", "excel", "leadership", "negotiation"],
    "cybersecurity analyst": ["sql", "git", "docker", "problem solving", "aws", "python"],
    "data engineer": ["python", "sql", "airflow", "spark", "docker", "aws", "kafka"],
}

GENERIC_SKILLS = ["communication", "problem solving", "project management", "excel", "data analysis", "critical thinking"]

WEEK_PHASES = [
    ("Week 1-2", "Foundations & role clarity"),
    ("Week 3-4", "Core skill building I"),
    ("Week 5-6", "Core skill building II"),
    ("Week 7-8", "Applied mini-project"),
    ("Week 9-10", "Portfolio & real-world practice"),
    ("Week 11", "Interview & networking prep"),
    ("Week 12-13", "Job-ready polish & applications"),
]


def _required_skills_for(target_role: str) -> list[str]:
    key = target_role.lower().strip()
    if key in ROLE_SKILL_MAP:
        return ROLE_SKILL_MAP[key]
    for k, v in ROLE_SKILL_MAP.items():
        if k in key or key in k:
            return v
    tokens = re.findall(r"[a-z]+", key)
    for k, v in ROLE_SKILL_MAP.items():
        if any(tok in k for tok in tokens):
            return v
    return GENERIC_SKILLS


def _template_roadmap(current_role: str | None, target_role: str, known_skills: list[str], weekly_hours: int) -> dict:
    required = _required_skills_for(target_role)
    known_l = {s.lower() for s in known_skills}
    gap_skills = [s for s in required if s.lower() not in known_l] or required[:4]

    weeks = []
    skills_per_phase = max(1, round(len(gap_skills) / max(1, len(WEEK_PHASES) - 2)))
    idx = 0
    for i, (label, focus) in enumerate(WEEK_PHASES):
        if i == 0:
            tasks = [
                f"Map the {target_role} role: responsibilities, tools, and 5 target companies",
                f"Audit current skills against {target_role} requirements and set a weekly {weekly_hours}h study block",
                "Set up a public portfolio (GitHub / personal site) if you don't have one",
            ]
            milestone = "Clear gap list + study schedule locked in"
        elif i in (1, 2):
            chunk = gap_skills[idx: idx + skills_per_phase] or gap_skills[-1:]
            idx += skills_per_phase
            tasks = [f"Complete a focused course or project on: {s}" for s in chunk]
            tasks.append(f"Practice with {weekly_hours // 2}h of hands-on exercises this week")
            milestone = f"Working knowledge of {', '.join(chunk) if chunk else 'core skills'}"
        elif i == 3:
            tasks = [
                f"Build one applied project that uses {', '.join(gap_skills[:3]) if gap_skills else 'your core skills'}",
                "Document the project (README, screenshots, short write-up)",
            ]
            milestone = "First portfolio-ready project shipped"
        elif i == 4:
            tasks = [
                "Build a second, more ambitious project or contribute to an open-source repo",
                "Get feedback from a mentor, peer, or online community",
            ]
            milestone = "Two strong portfolio pieces + feedback incorporated"
        elif i == 5:
            tasks = [
                f"Rewrite your resume and LinkedIn around {target_role}",
                "Prepare 5 STAR-format stories from your projects and past experience",
                "Reach out to 10 people in your target companies for informational chats",
            ]
            milestone = "Interview-ready resume + STAR stories + warm network"
        else:
            tasks = [
                "Mock interview practice (technical + behavioral)",
                f"Apply to a focused list of {target_role} roles using the Auto-Apply module",
                "Iterate resume/portfolio based on interview feedback",
            ]
            milestone = "Actively interviewing with a tightened application pipeline"
        weeks.append({"week_range": label, "focus": focus, "tasks": tasks, "milestone": milestone})

    summary = (
        f"A {weekly_hours}h/week plan to move from "
        f"{current_role or 'your current background'} to {target_role} in about 90 days, "
        f"closing the gap on: {', '.join(gap_skills[:5]) if gap_skills else 'role-specific polish'}."
    )
    return {"target_role": target_role, "source": "template", "summary": summary, "weeks": weeks}


def generate_roadmap(current_role: str | None, target_role: str, known_skills: list[str], weekly_hours: int) -> dict:
    system_prompt = (
        "You are a career coach AI. Generate a realistic, personalized 90-day learning "
        "roadmap as STRICT JSON only (no markdown fences), matching exactly this schema: "
        '{"summary": string, "weeks": [{"week_range": string, "focus": string, '
        '"tasks": [string, ...], "milestone": string}]}. '
        "Produce 6-8 week blocks (e.g. 'Week 1-2'). Be specific and practical, referencing "
        "real skills, tools, and project ideas for the target role."
    )
    user_prompt = (
        f"Current role: {current_role or 'Student / early career'}\n"
        f"Target role: {target_role}\n"
        f"Known skills: {', '.join(known_skills) if known_skills else 'none listed'}\n"
        f"Available study time: {weekly_hours} hours/week\n"
        "Generate the roadmap JSON now."
    )
    raw = ai_client.generate(system_prompt, user_prompt, max_tokens=1400)
    if raw:
        try:
            cleaned = raw.strip().strip("`")
            if cleaned.lower().startswith("json"):
                cleaned = cleaned[4:]
            data = json.loads(cleaned)
            return {
                "target_role": target_role,
                "source": "openai",
                "summary": data["summary"],
                "weeks": data["weeks"],
            }
        except Exception:
            pass  # fall through to template

    return _template_roadmap(current_role, target_role, known_skills, weekly_hours)
