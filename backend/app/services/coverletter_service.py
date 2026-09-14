"""
Autonomous Job Application Agent — application drafting half.

Generates a tailored cover letter and resume bullet suggestions for a
specific job + resume pair. Uses GPT-4o when configured, otherwise a
template engine that still personalizes using the actual matched/missing
skills from the Skill Gap Analyzer, so the fallback output references the
real job and the real resume rather than generic filler.
"""
from __future__ import annotations

from app.services import ai_client
from app.services.skill_matcher import analyze_gap

TONE_OPENERS = {
    "professional": "I am writing to express my interest in the {title} position at {company}.",
    "enthusiastic": "I was genuinely excited to see the {title} opening at {company} — it's exactly the kind of role I've been working toward.",
    "concise": "I'm applying for the {title} role at {company}.",
}


def _template_cover_letter(job_title: str, company: str, resume_text: str, tone: str, matched: list[str], missing: list[str]) -> str:
    opener = TONE_OPENERS.get(tone, TONE_OPENERS["professional"]).format(title=job_title, company=company)
    strengths = ", ".join(matched[:4]) if matched else "a strong, adaptable technical foundation"
    growth = missing[0] if missing else "the team's current priorities"

    body = (
        f"{opener}\n\n"
        f"My background gives me direct, hands-on experience with {strengths}, which lines up closely "
        f"with what this role needs. In previous work I've focused on shipping real outcomes rather than "
        f"just completing tasks, and I bring that same ownership to every project I join.\n\n"
        f"I'm also actively building depth in {growth}, so I can contribute from day one and keep growing "
        f"into the role's full scope. I'd welcome the chance to talk about how I can help the team at {company} "
        f"move faster on what you're building.\n\n"
        f"Thank you for your time and consideration."
    )
    return body


def _template_bullets(matched: list[str], missing: list[str]) -> list[str]:
    bullets = []
    for skill in matched[:3]:
        bullets.append(f"Applied {skill} to deliver measurable results in a real project or role — quantify the outcome (e.g. time saved, accuracy improved, users reached).")
    if missing:
        bullets.append(f"Consider a short project using {missing[0]} before you apply — even a small one gives you a genuine bullet point instead of a claim.")
    if not bullets:
        bullets.append("Add one quantified achievement (numbers, scale, or impact) to your strongest bullet point.")
    return bullets[:4]


def generate_application(job_title: str, company: str, job_description: str, resume_text: str, tone: str) -> dict:
    gap = analyze_gap(resume_text, job_description)
    matched, missing = gap["matched_skills"], gap["missing_skills"]

    system_prompt = (
        "You are an expert career coach writing a tailored, specific, non-generic cover letter. "
        f"Tone: {tone}. Keep it under 220 words, 3 short paragraphs, no clichés like "
        "'I am a hard worker' or 'team player'. Reference concrete skills from the candidate's resume "
        "that match the job. Do not invent experience the resume doesn't support."
    )
    user_prompt = (
        f"Job title: {job_title}\nCompany: {company}\nJob description: {job_description}\n\n"
        f"Candidate resume:\n{resume_text[:3000]}\n\n"
        f"Matched skills: {', '.join(matched) or 'none obviously listed'}\n"
        f"Skills the candidate is missing: {', '.join(missing) or 'none'}\n\n"
        "Write the cover letter now."
    )
    ai_letter = ai_client.generate(system_prompt, user_prompt, max_tokens=500)

    if ai_letter:
        cover_letter, source = ai_letter.strip(), "openai"
    else:
        cover_letter, source = _template_cover_letter(job_title, company, resume_text, tone, matched, missing), "template"

    return {
        "job_title": job_title,
        "company": company,
        "cover_letter": cover_letter,
        "source": source,
        "resume_bullet_suggestions": _template_bullets(matched, missing),
    }
