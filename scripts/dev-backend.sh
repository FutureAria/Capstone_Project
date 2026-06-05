#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../backend"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created backend/.env from backend/.env.example"
  echo "Fill YOUTUBE_API_KEY and ANTHROPIC_API_KEY before using external API endpoints."
fi

mvn spring-boot:run
