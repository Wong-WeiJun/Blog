#! /usr/bin/env bash

set -e

# Run on every container start (Render free tier has no pre-deploy step).
bash "$(dirname "$0")/prestart.sh"

exec fastapi run \
  --workers "${WEB_CONCURRENCY:-4}" \
  --host 0.0.0.0 \
  --port "${PORT:-8000}" \
  app/main.py
