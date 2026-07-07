.PHONY: help dev dev-backend dev-frontend build test test-backend test-frontend \
        lint lint-backend lint-frontend migrate reset-db logs stop clean generate-client env

# ── Config ──────────────────────────────────────────────────────────────────
COMPOSE        := docker compose
BACKEND_DIR    := backend
FRONTEND_DIR   := frontend

# default target
help:
	@echo ""
	@echo "  FastSkeleton — available commands"
	@echo ""
	@echo "  Dev"
	@echo "    make dev              Start full stack (docker compose watch)"
	@echo "    make dev-backend      Run backend locally with uv (no Docker)"
	@echo "    make dev-frontend     Run frontend dev server with bun"
	@echo ""
	@echo "  Build"
	@echo "    make build            Build all Docker images"
	@echo ""
	@echo "  Test"
	@echo "    make test             Run all tests"
	@echo "    make test-backend     Run backend pytest only"
	@echo "    make test-frontend    Run frontend Vitest only"
	@echo ""
	@echo "  Lint"
	@echo "    make lint             Run all linters"
	@echo "    make lint-backend     ruff check + format"
	@echo "    make lint-frontend    biome check"
	@echo ""
	@echo "  DB"
	@echo "    make migrate          Run alembic migrations"
	@echo "    make reset-db         Drop and recreate DB, re-run migrations"
	@echo "    make seed             Seed initial data"
	@echo ""
	@echo "  Utils"
	@echo "    make logs             Tail docker compose logs"
	@echo "    make stop             Stop all containers"
	@echo "    make clean            Stop + remove volumes (destructive)"
	@echo "    make generate-client  Regenerate frontend API client from OpenAPI"
	@echo "    make env              Copy .env.example to .env (first-time setup)"
	@echo ""

# ── Dev ─────────────────────────────────────────────────────────────────────
dev:
	$(COMPOSE) watch

# Run dev servers without the exclusive-watch lock (use if watch is already running)
dev-up:
	$(COMPOSE) up

dev-backend:
	cd $(BACKEND_DIR) && uv run fastapi run --reload app/main.py

dev-frontend:
	cd $(FRONTEND_DIR) && bun run dev

# ── Build ────────────────────────────────────────────────────────────────────
# NOTE: Only build the production compose file. compose.override.yml remaps the
# frontend dev service to oven/bun:1.2.23-debian; if we build with both files
# merged, Docker Compose tags the production nginx image as that bun image,
# permanently clobbering the upstream Bun runtime.
build:
	docker compose -f compose.yml build

# ── Test ─────────────────────────────────────────────────────────────────────
test: test-backend test-frontend

test-backend:
	$(COMPOSE) up -d db mailcatcher
	@echo "Waiting for DB..."
	@sleep 3
	cd $(BACKEND_DIR) && uv run bash scripts/prestart.sh
	cd $(BACKEND_DIR) && uv run bash scripts/tests-start.sh
	$(COMPOSE) down -v --remove-orphans

test-frontend:
	cd $(FRONTEND_DIR) && bun run test

# ── Lint ──────────────────────────────────────────────────────────────────────
lint: lint-backend lint-frontend

lint-backend:
	cd $(BACKEND_DIR) && uv run ruff check .
	cd $(BACKEND_DIR) && uv run ruff format --check .

lint-fix-backend:
	cd $(BACKEND_DIR) && uv run ruff check --fix .
	cd $(BACKEND_DIR) && uv run ruff format .

lint-frontend:
	cd $(FRONTEND_DIR) && bun run lint

# ── DB ────────────────────────────────────────────────────────────────────────
migrate:
	cd $(BACKEND_DIR) && uv run alembic upgrade head

migration:
	@read -p "Migration name: " name; \
	cd $(BACKEND_DIR) && uv run alembic revision --autogenerate -m "$$name"

reset-db:
	$(COMPOSE) down -v --remove-orphans
	$(COMPOSE) up -d db
	@echo "Waiting for DB..."
	@sleep 5
	cd $(BACKEND_DIR) && uv run bash scripts/prestart.sh
	@echo "DB reset and migrated."

seed:
	cd $(BACKEND_DIR) && uv run python app/initial_data.py

# ── Utils ─────────────────────────────────────────────────────────────────────
logs:
	$(COMPOSE) logs -f

stop:
	$(COMPOSE) stop

clean:
	$(COMPOSE) down -v --remove-orphans
	@echo "All containers and volumes removed."

generate-client:
	bash scripts/generate-client.sh

env:
	@if [ -f .env ]; then \
		echo ".env already exists, skipping."; \
	else \
		cp .env.example .env; \
		echo "Created .env from .env.example — fill in your secrets."; \
	fi
