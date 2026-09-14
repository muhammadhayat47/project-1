"""
Skill Gap Analyzer module.

Two techniques from the proposal's Feature Extraction section, both real
and running locally with no external calls:
  1. Taxonomy-based skill extraction (regex/word-boundary matching against
     a curated skills list — a lightweight stand-in for NER).
  2. TF-IDF + cosine similarity between the full resume and job description
     text, for an overall CV-JD match percentage.
"""
from __future__ import annotations

import re

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.utils.taxonomy import COURSE_CATALOG, DEFAULT_COURSE, SKILLS_TAXONOMY

_PATTERNS = {
    skill: re.compile(r"(?<![a-zA-Z0-9])" + re.escape(skill.lower()) + r"(?![a-zA-Z0-9])")
    for skill in SKILLS_TAXONOMY
}


def extract_skills(text: str) -> set[str]:
    text_l = text.lower()
    return {skill for skill, pattern in _PATTERNS.items() if pattern.search(text_l)}


def analyze_gap(resume_text: str, job_description: str) -> dict:
    resume_skills = extract_skills(resume_text)
    jd_skills = extract_skills(job_description)

    matched = sorted(resume_skills & jd_skills)
    missing = sorted(jd_skills - resume_skills)

    # Overall semantic match uses TF-IDF cosine similarity across the full texts,
    # blended with taxonomy skill coverage so a CV that lacks jargon but is
    # otherwise a strong topical match isn't scored at zero.
    coverage = (len(matched) / len(jd_skills)) if jd_skills else 0.0

    try:
        vec = TfidfVectorizer(stop_words="english", max_features=500)
        tfidf = vec.fit_transform([resume_text, job_description])
        semantic_sim = float(cosine_similarity(tfidf[0], tfidf[1])[0][0])
    except ValueError:
        semantic_sim = 0.0

    match_score = round((0.65 * coverage + 0.35 * semantic_sim) * 100, 1)

    recommended_courses = []
    for skill in missing[:6]:
        courses = COURSE_CATALOG.get(skill, [DEFAULT_COURSE])
        recommended_courses.append({"skill": skill, "courses": courses})

    return {
        "match_score_pct": match_score,
        "matched_skills": matched,
        "missing_skills": missing,
        "resume_skill_count": len(resume_skills),
        "jd_skill_count": len(jd_skills),
        "recommended_courses": recommended_courses,
    }
