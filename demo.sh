#!/usr/bin/env bash
set -e

PORT="${APP_PORT:-8082}"
URL="http://localhost:${PORT}/conversation"

cleanup() {
    echo ""
    echo "Stopping demo..."
    docker compose down
}
trap cleanup EXIT

echo "Building and starting demo..."
docker compose up --build -d

echo "Waiting for app to be ready..."
until curl -sf "http://localhost:${PORT}/health" > /dev/null 2>&1; do
    sleep 1
done

echo ""
echo "  Demo is ready!"
echo ""
echo "  $URL"
echo ""
echo "  Press any key to stop."
echo ""

read -rsn1
