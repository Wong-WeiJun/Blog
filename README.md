# BlogSite

A full-stack developer blog with a modern React frontend and a FastAPI backend. Features a public blog with an admin dashboard, RSS feeds, and content management.

## Overview

BlogSite is a complete blogging platform built with a React SPA frontend and a FastAPI backend. It supports public blog browsing, an admin dashboard, RSS feeds, and email subscriptions. All routing, auth, and content management are fully functional.

## Stack

| Layer | Tech |
|-------|------|
| Backend | FastAPI, SQLModel, Alembic, PostgreSQL |
| Frontend | React 18, Vite, Tailwind CSS v4, shadcn/ui |
| Auth | JWT (PyJWT + pwdlib argon2) |
| Dev | Docker Compose, uv, bun |
| CI | GitHub Actions (ci, deploy, pre-commit) |

## Quickstart

```bash
# 1. Clone and set up env
#    Copy .env.example -> .env and fill in your values
cp .env.example .env

# 2. Start the full stack
make dev

# 3. Open
#   Frontend:  http://localhost:5173
#   API docs:   http://localhost:8000/docs
#   Adminer:    http://localhost:8080
```

## Features

### Public Blog
- **Homepage**: Hero, featured post, and responsive post grid.
- **Blog Posts**: Full articles with sticky table of contents, reading progress bar, and syntax-highlighted code blocks.
- **Comments**: Comment sections on blog posts.
- **Pages**: About, Contact, Projects.
- **RSS Feed**: `/feed.xml` endpoint for subscribing to new posts.
- **Dark Theme**: Deep navy aesthetic with brand purple accents.

### Admin Dashboard
- **Overview**: Dashboard with key metrics and charts (Recharts).
- **Posts**: Create, edit, and manage blog posts.
- **Analytics**: Data visualization.
- **Comment Moderation**: Review and manage comments.

### Backend API
- **Blog Posts**: CRUD with publishing and drafts.
- **RSS Feed**: Automatic RSS generation for published posts.
- **Contact Form**: Email submissions stored in the database.
- **Uploads**: Image uploads for post covers and avatars with S3/MinIO.
- **User Management**: Registration, login, and profile management.
- **Email**: Mailcatcher for local email testing.

## Project Structure

```
.
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── api/      # API routes (posts, feed, contact, uploads, users)
│   │   ├── crud.py   # Database operations
│   │   ├── models.py # SQLModel models
│   │   └── core/     # Config, security, db
│   └── tests/
├── frontend/         # React + Vite frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/   # Blog pages, admin dashboard, auth
│   │   │   └── admin/        # Admin views (overview, posts, analytics)
│   │   └── styles/           # Tailwind CSS v4, theme
│   └── ...
├── compose.yml       # Docker Compose services
└── Makefile          # Top-level task runner
```

## Common Commands

```bash
# Full stack
make dev              # Start all services (db, backend, frontend)
make test             # Run all tests (backend + frontend)
make lint             # Lint backend and frontend

# Backend only
cd backend && uv sync                    # Install Python deps
cd backend && bash scripts/test.sh       # Run backend tests
cd backend && alembic upgrade head       # Run migrations

# Frontend only
cd frontend && pnpm install            # Install frontend deps
cd frontend && pnpm dev                # Start frontend dev server
```

## GitHub Actions

| Workflow | Trigger | Does |
|----------|---------|------|
| `ci.yml` | push/PR to `main` | lint backend+frontend, run tests, smoke test |
| `deploy.yml` | manual or on release | build + push to ECR, deploy to ECS |
| `pre-commit.yml` | PR | runs pre-commit hooks |

## Customising for a New Project

1. Rename `Item`/`items` throughout `backend/app/` to your domain model.
2. Update `PROJECT_NAME` in `.env`.
3. Update `AWS_REGION` and repo names in `deploy.yml`.
4. Update frontend branding in `frontend/src/app/components/`.

## License

MIT
