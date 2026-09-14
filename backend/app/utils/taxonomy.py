"""
Static reference data: the skills taxonomy, a course catalog mapped to
skills, and lookup lists used to keep the synthetic datasets realistic.
This plays the role the proposal assigns to O*NET / Coursera / Udemy data
sources, condensed into an offline dataset so the whole app runs with zero
external accounts.
"""

SKILLS_TAXONOMY: list[str] = [
    # Languages & core CS
    "python", "java", "javascript", "typescript", "c++", "c#", "go", "sql", "r",
    # Web / app
    "react", "next.js", "node.js", "vue", "angular", "html", "css", "tailwind css",
    "rest api", "graphql", "django", "flask", "fastapi", "spring boot",
    # Data / cloud infra
    "docker", "kubernetes", "aws", "azure", "gcp", "terraform", "ci/cd", "git",
    "postgresql", "mongodb", "redis", "airflow", "spark", "kafka",
    # Data science / AI
    "machine learning", "deep learning", "nlp", "computer vision", "pandas",
    "numpy", "scikit-learn", "tensorflow", "pytorch", "data analysis",
    "data visualization", "statistics", "a/b testing", "llm", "prompt engineering",
    # Analytics / BI
    "excel", "power bi", "tableau", "looker", "sql server",
    # Design
    "figma", "ui/ux design", "adobe xd", "wireframing", "user research",
    # Product / soft skills
    "project management", "agile", "scrum", "stakeholder management",
    "communication", "leadership", "public speaking", "negotiation",
    "problem solving", "critical thinking", "mentoring",
    # Marketing / business
    "seo", "content marketing", "google analytics", "salesforce", "crm",
    "financial modeling", "accounting", "supply chain management",
]

# skill -> list of representative course recommendations
COURSE_CATALOG: dict[str, list[dict]] = {
    "python": [{"title": "Python for Everybody", "provider": "Coursera", "level": "Beginner"}],
    "machine learning": [{"title": "Machine Learning Specialization", "provider": "Coursera (DeepLearning.AI)", "level": "Intermediate"}],
    "deep learning": [{"title": "Deep Learning Specialization", "provider": "Coursera (DeepLearning.AI)", "level": "Advanced"}],
    "nlp": [{"title": "NLP Specialization", "provider": "Coursera (DeepLearning.AI)", "level": "Advanced"}],
    "computer vision": [{"title": "Computer Vision Basics", "provider": "Coursera", "level": "Intermediate"}],
    "tensorflow": [{"title": "TensorFlow Developer Certificate Prep", "provider": "Udemy", "level": "Intermediate"}],
    "pytorch": [{"title": "PyTorch for Deep Learning", "provider": "Udemy", "level": "Intermediate"}],
    "sql": [{"title": "The Complete SQL Bootcamp", "provider": "Udemy", "level": "Beginner"}],
    "aws": [{"title": "AWS Certified Cloud Practitioner", "provider": "Coursera", "level": "Beginner"}],
    "azure": [{"title": "Microsoft Azure Fundamentals AZ-900", "provider": "Udemy", "level": "Beginner"}],
    "gcp": [{"title": "Google Cloud Digital Leader", "provider": "Coursera", "level": "Beginner"}],
    "docker": [{"title": "Docker & Kubernetes: The Practical Guide", "provider": "Udemy", "level": "Intermediate"}],
    "kubernetes": [{"title": "Kubernetes for the Absolute Beginners", "provider": "Udemy", "level": "Intermediate"}],
    "react": [{"title": "React - The Complete Guide", "provider": "Udemy", "level": "Intermediate"}],
    "node.js": [{"title": "Node.js, Express, MongoDB Bootcamp", "provider": "Udemy", "level": "Intermediate"}],
    "data analysis": [{"title": "Google Data Analytics Certificate", "provider": "Coursera", "level": "Beginner"}],
    "data visualization": [{"title": "Data Visualization with Tableau", "provider": "Coursera", "level": "Beginner"}],
    "power bi": [{"title": "Microsoft Power BI Desktop for Business", "provider": "Udemy", "level": "Beginner"}],
    "excel": [{"title": "Excel Skills for Business Specialization", "provider": "Coursera", "level": "Beginner"}],
    "project management": [{"title": "Google Project Management Certificate", "provider": "Coursera", "level": "Beginner"}],
    "agile": [{"title": "Agile Development Specialization", "provider": "Coursera", "level": "Beginner"}],
    "scrum": [{"title": "Professional Scrum Master I Prep", "provider": "Udemy", "level": "Intermediate"}],
    "ui/ux design": [{"title": "Google UX Design Certificate", "provider": "Coursera", "level": "Beginner"}],
    "figma": [{"title": "Figma UI/UX Design Essentials", "provider": "Udemy", "level": "Beginner"}],
    "git": [{"title": "Git & GitHub - The Practical Guide", "provider": "Udemy", "level": "Beginner"}],
    "statistics": [{"title": "Statistics with Python Specialization", "provider": "Coursera", "level": "Intermediate"}],
    "llm": [{"title": "Generative AI with Large Language Models", "provider": "Coursera (DeepLearning.AI)", "level": "Advanced"}],
    "prompt engineering": [{"title": "ChatGPT Prompt Engineering for Developers", "provider": "DeepLearning.AI", "level": "Beginner"}],
    "seo": [{"title": "SEO Specialization", "provider": "Coursera", "level": "Beginner"}],
    "google analytics": [{"title": "Google Analytics for Beginners", "provider": "Google Skillshop", "level": "Beginner"}],
    "salesforce": [{"title": "Salesforce Administrator Certification Prep", "provider": "Udemy", "level": "Intermediate"}],
    "financial modeling": [{"title": "Financial Modeling & Valuation", "provider": "Coursera", "level": "Intermediate"}],
}

DEFAULT_COURSE = {"title": "Skill-specific short course", "provider": "Coursera / Udemy", "level": "Beginner"}

JOB_TITLES: list[str] = [
    "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
    "Data Scientist", "Data Analyst", "Machine Learning Engineer", "AI Engineer",
    "DevOps Engineer", "Cloud Engineer", "Product Manager", "Project Manager",
    "UI/UX Designer", "QA Engineer", "Business Analyst", "Digital Marketing Specialist",
    "Financial Analyst", "HR Generalist", "Customer Support Specialist", "Sales Executive",
    "Content Writer", "Cybersecurity Analyst", "Mobile App Developer", "Database Administrator",
    "Network Engineer", "Accountant", "Operations Manager", "Recruiter", "Graphic Designer",
    "Data Engineer",
]

COMPANIES: list[str] = [
    "Nimbus Systems", "Vertex Analytics", "Northgate Software", "Lumen Digital",
    "Quanta Labs", "BluePeak Technologies", "Skyline Robotics", "Corewave Inc.",
    "Meridian Data", "Ashgrove Fintech", "Orbitel Communications", "Pixel Forge Studios",
    "Silverline Cloud", "Bright Path Health Tech", "Ironclad Security", "Ferrow Logistics",
    "Cobalt Retail Group", "Harborview Bank", "Solace Energy", "Greenfield AgriTech",
]

COUNTRIES: list[dict] = [
    # North America
    {"country": "United States", "code": "US", "lat": 39.8, "lon": -98.6, "cost_index": 1.00},
    {"country": "Canada", "code": "CA", "lat": 56.1, "lon": -106.3, "cost_index": 0.82},
    {"country": "Mexico", "code": "MX", "lat": 23.6, "lon": -102.5, "cost_index": 0.36},

    # South America
    {"country": "Brazil", "code": "BR", "lat": -14.2, "lon": -51.9, "cost_index": 0.38},
    {"country": "Argentina", "code": "AR", "lat": -38.4, "lon": -63.6, "cost_index": 0.34},
    {"country": "Chile", "code": "CL", "lat": -35.7, "lon": -71.5, "cost_index": 0.44},
    {"country": "Colombia", "code": "CO", "lat": 4.6, "lon": -74.3, "cost_index": 0.33},
    {"country": "Peru", "code": "PE", "lat": -9.2, "lon": -75.0, "cost_index": 0.30},

    # Western & Northern Europe
    {"country": "United Kingdom", "code": "GB", "lat": 55.4, "lon": -3.4, "cost_index": 0.78},
    {"country": "Germany", "code": "DE", "lat": 51.2, "lon": 10.4, "cost_index": 0.74},
    {"country": "France", "code": "FR", "lat": 46.6, "lon": 2.2, "cost_index": 0.76},
    {"country": "Netherlands", "code": "NL", "lat": 52.1, "lon": 5.3, "cost_index": 0.80},
    {"country": "Ireland", "code": "IE", "lat": 53.4, "lon": -8.2, "cost_index": 0.83},
    {"country": "Switzerland", "code": "CH", "lat": 46.8, "lon": 8.2, "cost_index": 1.15},
    {"country": "Sweden", "code": "SE", "lat": 60.1, "lon": 18.6, "cost_index": 0.79},
    {"country": "Norway", "code": "NO", "lat": 60.5, "lon": 8.5, "cost_index": 0.90},
    {"country": "Denmark", "code": "DK", "lat": 56.3, "lon": 9.5, "cost_index": 0.85},
    {"country": "Finland", "code": "FI", "lat": 61.9, "lon": 25.7, "cost_index": 0.77},
    {"country": "Belgium", "code": "BE", "lat": 50.5, "lon": 4.5, "cost_index": 0.75},
    {"country": "Austria", "code": "AT", "lat": 47.5, "lon": 14.6, "cost_index": 0.76},

    # Southern Europe
    {"country": "Spain", "code": "ES", "lat": 40.5, "lon": -3.7, "cost_index": 0.62},
    {"country": "Italy", "code": "IT", "lat": 41.9, "lon": 12.6, "cost_index": 0.64},
    {"country": "Portugal", "code": "PT", "lat": 39.4, "lon": -8.2, "cost_index": 0.54},
    {"country": "Greece", "code": "GR", "lat": 39.1, "lon": 21.8, "cost_index": 0.48},

    # Central & Eastern Europe
    {"country": "Poland", "code": "PL", "lat": 51.9, "lon": 19.1, "cost_index": 0.46},
    {"country": "Romania", "code": "RO", "lat": 45.9, "lon": 24.9, "cost_index": 0.40},
    {"country": "Czech Republic", "code": "CZ", "lat": 49.8, "lon": 15.5, "cost_index": 0.50},
    {"country": "Ukraine", "code": "UA", "lat": 48.4, "lon": 31.2, "cost_index": 0.26},
    {"country": "Turkey", "code": "TR", "lat": 38.9, "lon": 35.2, "cost_index": 0.35},

    # Middle East
    {"country": "United Arab Emirates", "code": "AE", "lat": 23.4, "lon": 53.8, "cost_index": 0.68},
    {"country": "Saudi Arabia", "code": "SA", "lat": 23.9, "lon": 45.1, "cost_index": 0.58},
    {"country": "Israel", "code": "IL", "lat": 31.0, "lon": 34.9, "cost_index": 0.86},
    {"country": "Qatar", "code": "QA", "lat": 25.3, "lon": 51.2, "cost_index": 0.72},

    # South Asia
    {"country": "India", "code": "IN", "lat": 20.6, "lon": 78.9, "cost_index": 0.28},
    {"country": "Pakistan", "code": "PK", "lat": 30.4, "lon": 69.3, "cost_index": 0.22},
    {"country": "Bangladesh", "code": "BD", "lat": 23.7, "lon": 90.4, "cost_index": 0.20},
    {"country": "Sri Lanka", "code": "LK", "lat": 7.9, "lon": 80.7, "cost_index": 0.23},

    # East & Southeast Asia
    {"country": "China", "code": "CN", "lat": 35.9, "lon": 104.2, "cost_index": 0.42},
    {"country": "Japan", "code": "JP", "lat": 36.2, "lon": 138.3, "cost_index": 0.75},
    {"country": "South Korea", "code": "KR", "lat": 35.9, "lon": 127.8, "cost_index": 0.70},
    {"country": "Singapore", "code": "SG", "lat": 1.35, "lon": 103.8, "cost_index": 0.92},
    {"country": "Malaysia", "code": "MY", "lat": 4.2, "lon": 101.9, "cost_index": 0.34},
    {"country": "Indonesia", "code": "ID", "lat": -0.8, "lon": 113.9, "cost_index": 0.27},
    {"country": "Vietnam", "code": "VN", "lat": 14.1, "lon": 108.3, "cost_index": 0.25},
    {"country": "Thailand", "code": "TH", "lat": 15.9, "lon": 100.9, "cost_index": 0.31},
    {"country": "Philippines", "code": "PH", "lat": 12.9, "lon": 121.8, "cost_index": 0.24},
    {"country": "Taiwan", "code": "TW", "lat": 23.7, "lon": 121.0, "cost_index": 0.55},

    # Oceania
    {"country": "Australia", "code": "AU", "lat": -25.3, "lon": 133.8, "cost_index": 0.88},
    {"country": "New Zealand", "code": "NZ", "lat": -40.9, "lon": 174.9, "cost_index": 0.81},

    # Africa
    {"country": "South Africa", "code": "ZA", "lat": -30.6, "lon": 22.9, "cost_index": 0.32},
    {"country": "Nigeria", "code": "NG", "lat": 9.1, "lon": 8.7, "cost_index": 0.19},
    {"country": "Egypt", "code": "EG", "lat": 26.8, "lon": 30.8, "cost_index": 0.21},
    {"country": "Kenya", "code": "KE", "lat": -0.0, "lon": 37.9, "cost_index": 0.23},
    {"country": "Morocco", "code": "MA", "lat": 31.8, "lon": -7.1, "cost_index": 0.29},
]
