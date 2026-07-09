"""add site_about

Revision ID: d8a1f3b20c41
Revises: c7e4f1a92b30
Create Date: 2026-07-08 12:00:00.000000

"""
from datetime import datetime, timezone

import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from alembic import op

revision = "d8a1f3b20c41"
down_revision = "c7e4f1a92b30"
branch_labels = None
depends_on = None

DEFAULT_ABOUT_PARAGRAPHS = [
    "Hi there! This blog is a personal sandbox for documenting cloud infrastructure, DevOps practices, and software engineering patterns. Every post here started as a real problem faced in a project or a gap in documentation I wished existed.",
    "The focus is on practical, production-ready approaches — not just theory. From Terraform modules and CI/CD pipelines to container orchestration and monitoring, the goal is to share what actually works.",
    "New posts go up whenever there's something worth documenting. Subscribe via RSS or check back periodically for updates.",
]

DEFAULT_SKILL_GROUPS = [
    {
        "category": "Cloud",
        "icon": "cloud",
        "color": "#f97316",
        "skills": [
            {"name": "AWS", "level": 85},
            {"name": "GCP", "level": 55},
            {"name": "Terraform", "level": 78},
            {"name": "CloudFormation", "level": 60},
        ],
    },
    {
        "category": "Backend",
        "icon": "server",
        "color": "#3b82f6",
        "skills": [
            {"name": "Python", "level": 88},
            {"name": "FastAPI", "level": 82},
            {"name": "PostgreSQL", "level": 75},
            {"name": "Redis", "level": 65},
        ],
    },
    {
        "category": "DevOps",
        "icon": "git-branch",
        "color": "#22c55e",
        "skills": [
            {"name": "Docker", "level": 90},
            {"name": "Kubernetes", "level": 70},
            {"name": "GitHub Actions", "level": 85},
            {"name": "Prometheus", "level": 68},
            {"name": "Grafana", "level": 60},
        ],
    },
]

DEFAULT_CERTIFICATIONS = [
    {
        "name": "AWS Solutions Architect Associate",
        "issuer": "Amazon Web Services",
        "date": "2025",
        "badge": "SAA-C03",
        "color": "#f97316",
        "abbr": "SAA",
    },
    {
        "name": "IBM Data Engineering Professional",
        "issuer": "IBM / Coursera",
        "date": "2024",
        "badge": "DE-PRO",
        "color": "#3b82f6",
        "abbr": "IBM",
    },
]

DEFAULT_EDUCATION = [
    {
        "institution": "Your University",
        "degree": "B.S. (Hons) Computer Science",
        "minor": "Minor in Statistics",
        "start": "Aug 2022",
        "end": "May 2026",
        "current": True,
        "gpa": "—",
        "highlights": ["Add your achievements here"],
    },
    {
        "institution": "Your Previous School",
        "degree": "Diploma / A-Levels / etc.",
        "minor": "",
        "start": "Apr 2019",
        "end": "Mar 2022",
        "current": False,
        "gpa": "—",
        "highlights": ["Add your highlights here"],
    },
]

DEFAULT_INTERESTS = [
    {"icon": "terminal", "label": "Homelab tinkering", "color": "#5046e5"},
    {"icon": "book-open", "label": "Technical writing", "color": "#06b6d4"},
    {"icon": "coffee", "label": "Specialty coffee", "color": "#f97316"},
    {"icon": "gamepad-2", "label": "Indie games", "color": "#22c55e"},
    {"icon": "music", "label": "Lo-fi playlists", "color": "#8b5cf6"},
    {"icon": "plane", "label": "Budget travel", "color": "#f59e0b"},
    {"icon": "camera", "label": "Street photography", "color": "#ec4899"},
    {"icon": "layers", "label": "Open source", "color": "#4ade80"},
    {"icon": "database", "label": "Data hoarding", "color": "#a5b4fc"},
]


def upgrade():
    site_about = sa.table(
        "siteabout",
        sa.column("id", sa.Integer),
        sa.column("homepage_tagline", sqlmodel.sql.sqltypes.AutoString()),
        sa.column("homepage_headline", sqlmodel.sql.sqltypes.AutoString()),
        sa.column("homepage_headline_accent", sqlmodel.sql.sqltypes.AutoString()),
        sa.column("homepage_bio", sqlmodel.sql.sqltypes.AutoString()),
        sa.column("hero_subtitle", sqlmodel.sql.sqltypes.AutoString()),
        sa.column("hero_bio", sqlmodel.sql.sqltypes.AutoString()),
        sa.column("open_to_work", sa.Boolean),
        sa.column("resume_url", sqlmodel.sql.sqltypes.AutoString(length=1000)),
        sa.column("github_url", sqlmodel.sql.sqltypes.AutoString(length=1000)),
        sa.column("linkedin_url", sqlmodel.sql.sqltypes.AutoString(length=1000)),
        sa.column("about_paragraphs", sa.JSON),
        sa.column("pull_quote", sqlmodel.sql.sqltypes.AutoString()),
        sa.column("pull_quote_attribution", sqlmodel.sql.sqltypes.AutoString()),
        sa.column("location", sqlmodel.sql.sqltypes.AutoString()),
        sa.column("availability_text", sqlmodel.sql.sqltypes.AutoString()),
        sa.column("cta_heading", sqlmodel.sql.sqltypes.AutoString()),
        sa.column("cta_subtext", sqlmodel.sql.sqltypes.AutoString()),
        sa.column("skill_groups", sa.JSON),
        sa.column("certifications", sa.JSON),
        sa.column("education", sa.JSON),
        sa.column("interests", sa.JSON),
        sa.column("updated_at", sa.DateTime(timezone=True)),
    )

    op.create_table(
        "siteabout",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column(
            "homepage_tagline",
            sqlmodel.sql.sqltypes.AutoString(),
            nullable=False,
        ),
        sa.Column(
            "homepage_headline",
            sqlmodel.sql.sqltypes.AutoString(),
            nullable=False,
        ),
        sa.Column(
            "homepage_headline_accent",
            sqlmodel.sql.sqltypes.AutoString(),
            nullable=False,
        ),
        sa.Column("homepage_bio", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("hero_subtitle", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("hero_bio", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("open_to_work", sa.Boolean(), nullable=False),
        sa.Column(
            "resume_url",
            sqlmodel.sql.sqltypes.AutoString(length=1000),
            nullable=True,
        ),
        sa.Column(
            "github_url",
            sqlmodel.sql.sqltypes.AutoString(length=1000),
            nullable=True,
        ),
        sa.Column(
            "linkedin_url",
            sqlmodel.sql.sqltypes.AutoString(length=1000),
            nullable=True,
        ),
        sa.Column("about_paragraphs", sa.JSON(), nullable=False),
        sa.Column("pull_quote", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column(
            "pull_quote_attribution",
            sqlmodel.sql.sqltypes.AutoString(),
            nullable=False,
        ),
        sa.Column("location", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column(
            "availability_text",
            sqlmodel.sql.sqltypes.AutoString(),
            nullable=False,
        ),
        sa.Column("cta_heading", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("cta_subtext", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("skill_groups", sa.JSON(), nullable=False),
        sa.Column("certifications", sa.JSON(), nullable=False),
        sa.Column("education", sa.JSON(), nullable=False),
        sa.Column("interests", sa.JSON(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    now = datetime.now(timezone.utc)
    op.bulk_insert(
        site_about,
        [
            {
                "id": 1,
                "homepage_tagline": "Building cool things in the cloud",
                "homepage_headline": "Cloud Engineer",
                "homepage_headline_accent": "in progress.",
                "homepage_bio": (
                    "Building resilient infrastructure, automating deployments, "
                    "and documenting the journey — one cloud pattern at a time."
                ),
                "hero_subtitle": "Cloud Engineer in Progress · SRE Aspirant",
                "hero_bio": (
                    "A developer blog chronicling cloud infrastructure, DevOps "
                    "practices, and the hard-won lessons learned along the way."
                ),
                "open_to_work": True,
                "resume_url": "/Resume.pdf",
                "github_url": "https://github.com/Wong-WeiJun",
                "linkedin_url": (
                    "https://www.linkedin.com/in/wei-jun-wong-507069357/"
                ),
                "about_paragraphs": DEFAULT_ABOUT_PARAGRAPHS,
                "pull_quote": (
                    "The best infrastructure is the kind you forget is there "
                    "until the day it quietly saves you at 2 AM."
                ),
                "pull_quote_attribution": "engineer-in-progress",
                "location": "Planet Earth",
                "availability_text": "Always learning",
                "cta_heading": "Let's work together",
                "cta_subtext": (
                    "Interested in cloud engineering, SRE, or infrastructure roles."
                ),
                "skill_groups": DEFAULT_SKILL_GROUPS,
                "certifications": DEFAULT_CERTIFICATIONS,
                "education": DEFAULT_EDUCATION,
                "interests": DEFAULT_INTERESTS,
                "updated_at": now,
            }
        ],
    )


def downgrade():
    op.drop_table("siteabout")
