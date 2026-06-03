#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATIC_DIR="$ROOT_DIR/backend/src/main/resources/static"

cd "$ROOT_DIR"

rm -rf dist "$STATIC_DIR"
npm ci
npm run lint -- --quiet
npm run build

mkdir -p "$STATIC_DIR"
cp -R dist/. "$STATIC_DIR/"

cd "$ROOT_DIR/backend"
mvn clean test
mvn package -DskipTests

du -sh "$ROOT_DIR/dist" "$ROOT_DIR/backend/target/backend-0.0.1-SNAPSHOT.jar"
