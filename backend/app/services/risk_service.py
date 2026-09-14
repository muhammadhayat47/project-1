"""
AI Job Risk Assessment module.

Trains a small RandomForest classifier (scikit-learn — "Boost[ed]" model
family named in the proposal) on a curated seed dataset of job
characteristics, then scores any job title/description by first checking
for a close match in the seed set and otherwise estimating its
characteristics from keyword signal in the title + description. The model
trains once at process startup (a few milliseconds on 30 rows) and is
reused for every request.
"""
from __future__ import annotations

import re

from sklearn.ensemble import RandomForestClassifier

from app.services.seed_data import risk_training_dataset

FEATURES = ["routineness", "creativity", "social", "physical", "data_driven"]

# Keyword signal banks used to estimate features for a job we haven't seen before.
_KEYWORDS: dict[str, list[str]] = {
    "routineness": ["data entry", "processing", "repetitive", "clerk", "operator", "cashier",
                    "bookkeeping", "invoice", "scheduling", "assembly", "sorting", "filing"],
    "creativity": ["design", "creative", "strategy", "innovat", "content", "brand", "research",
                   "engineer", "architect", "product", "writing", "art"],
    "social": ["customer", "client", "sales", "support", "teach", "counsel", "nurse", "care",
               "manage", "hr", "recruit", "communication", "stakeholder", "negotiat"],
    "physical": ["driver", "warehouse", "construction", "electrician", "plumb", "field",
                 "technician", "manufacturing", "assembly", "delivery", "repair", "install"],
    "data_driven": ["data", "analytics", "analyst", "scientist", "statistics", "reporting",
                     "financial", "accounting", "machine learning", "ai", "sql", "model"],
}


def _keyword_score(text: str, keywords: list[str]) -> float:
    text_l = text.lower()
    hits = sum(1 for kw in keywords if kw in text_l)
    return min(1.0, hits / 3.0)


def _estimate_features(title: str, description: str | None) -> dict[str, float]:
    text = f"{title} {description or ''}"
    scores = {feat: 0.35 + 0.5 * _keyword_score(text, kws) for feat, kws in _KEYWORDS.items()}
    return scores


def _closest_seed_match(title: str, dataset: list[dict]) -> dict | None:
    title_l = title.lower().strip()
    for row in dataset:
        if row["title"].lower() == title_l:
            return row
    for row in dataset:
        seed_words = set(re.findall(r"[a-z]+", row["title"].lower()))
        query_words = set(re.findall(r"[a-z]+", title_l))
        if seed_words & query_words and len(seed_words & query_words) >= 1:
            return row
    return None


class RiskModel:
    def __init__(self) -> None:
        self.dataset = risk_training_dataset()
        self.clf = RandomForestClassifier(n_estimators=300, max_depth=4, random_state=42)
        X = [[row[f] for f in FEATURES] for row in self.dataset]
        y = [row["risk"] for row in self.dataset]
        self.clf.fit(X, y)
        self.classes_ = [str(c) for c in self.clf.classes_]  # plain str, not numpy.str_

    def predict(self, title: str, description: str | None = None) -> dict:
        seed_match = _closest_seed_match(title, self.dataset)
        if seed_match:
            features = {f: seed_match[f] for f in FEATURES}
        else:
            features = _estimate_features(title, description)

        X = [[features[f] for f in FEATURES]]
        proba = self.clf.predict_proba(X)[0]
        breakdown = {cls: round(float(p) * 100, 1) for cls, p in zip(self.classes_, proba)}
        risk_level = max(breakdown, key=breakdown.get)
        risk_score = breakdown[risk_level]

        drivers = self._drivers(features, risk_level)
        tips = self._resilience_tips(risk_level, features)

        return {
            "job_title": title,
            "risk_level": risk_level,
            "risk_score_pct": risk_score,
            "probability_breakdown": breakdown,
            "drivers": drivers,
            "resilience_tips": tips,
        }

    @staticmethod
    def _drivers(features: dict[str, float], risk_level: str) -> list[str]:
        drivers = []
        if features["routineness"] > 0.6:
            drivers.append("High share of routine, repeatable tasks")
        if features["data_driven"] > 0.7:
            drivers.append("Heavily structured, data-driven workflow")
        if features["creativity"] > 0.6:
            drivers.append("Strong reliance on original judgment and creativity")
        if features["social"] > 0.7:
            drivers.append("High face-to-face / relationship-driven interaction")
        if features["physical"] > 0.6:
            drivers.append("Hands-on physical or on-site work")
        if not drivers:
            drivers.append("Balanced mix of routine and judgment-based tasks")
        return drivers[:4]

    @staticmethod
    def _resilience_tips(risk_level: str, features: dict[str, float]) -> list[str]:
        tips = []
        if risk_level == "High":
            tips.append("Move toward the judgment-heavy parts of this role — review, exceptions, and stakeholder decisions rather than routine execution.")
            tips.append("Learn to operate the AI tools that automate this work, so you supervise the system rather than compete with it.")
        elif risk_level == "Medium":
            tips.append("Deepen the parts of the job that need context and negotiation — these are the hardest to automate.")
            tips.append("Pick up one adjacent skill (data analysis or a domain AI tool) to move toward the low-risk end of the role.")
        else:
            tips.append("Keep building the creative, strategic, and relationship-driven parts of the role — they compound your advantage.")
            tips.append("Stay fluent in AI tooling for your field so you can direct it rather than be displaced by someone who does.")
        if features["data_driven"] < 0.4:
            tips.append("Add one data or AI-tooling skill — it's the fastest way to raise your leverage in almost any role.")
        return tips[:3]


_risk_model: RiskModel | None = None


def get_risk_model() -> RiskModel:
    global _risk_model
    if _risk_model is None:
        _risk_model = RiskModel()
    return _risk_model
