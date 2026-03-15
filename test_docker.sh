#!/usr/bin/env bash
set -e

IMAGE="history2life-test"
CONTAINER="history2life-test-container"
PORT=8082

cleanup() {
    docker rm -f "$CONTAINER" 2>/dev/null || true
}
trap cleanup EXIT

echo "Building Docker image..."
docker build -t "$IMAGE" .

echo "Starting container on port $PORT..."
docker run -d --name "$CONTAINER" -p "$PORT:$PORT" "$IMAGE"

echo "Waiting for server to be ready..."
for i in $(seq 1 15); do
    if curl -sf "http://localhost:$PORT/health" > /dev/null 2>&1; then
        echo "Server is up after ${i}s"
        break
    fi
    if [ "$i" -eq 15 ]; then
        echo "ERROR: Server did not respond within 15 seconds"
        docker logs "$CONTAINER"
        exit 1
    fi
    sleep 1
done

echo "Testing endpoints..."

ROOT=$(curl -sf "http://localhost:$PORT/")
echo "GET /        -> $ROOT"
echo "$ROOT" | grep -q '"status":"ok"' || { echo "FAIL: unexpected response from /"; exit 1; }

HEALTH=$(curl -sf "http://localhost:$PORT/health")
echo "GET /health  -> $HEALTH"
echo "$HEALTH" | grep -q '"status":"healthy"' || { echo "FAIL: unexpected response from /health"; exit 1; }

echo ""
echo "All tests passed. Webserver is running correctly on port $PORT."
