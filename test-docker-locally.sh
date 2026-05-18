#!/bin/bash
# Test Docker build and static file serving locally
# Usage: bash test-docker-locally.sh

set -e

echo "════════════════════════════════════════════════════════════"
echo "Docker Build & Test Script - Crediclass Dashboard"
echo "════════════════════════════════════════════════════════════"

PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
DOCKERFILE="$PROJECT_ROOT/Dockerfile"
IMAGE_NAME="crediclass-test:latest"
CONTAINER_NAME="crediclass-test-container"

# Check Docker is installed
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed or not in PATH"
    exit 1
fi

echo ""
echo "1️⃣  Building Docker image (no cache)..."
echo "   Command: docker build --no-cache -t $IMAGE_NAME $PROJECT_ROOT"
docker build --no-cache -t "$IMAGE_NAME" "$PROJECT_ROOT"

echo ""
echo "2️⃣  Checking build log for COPY steps..."
docker build -t "$IMAGE_NAME" "$PROJECT_ROOT" 2>&1 | grep -E "COPY|chmod" || echo "   (no COPY/chmod output captured)"

echo ""
echo "3️⃣  Verifying frontend files in image..."
docker run --rm "$IMAGE_NAME" ls -la /app/frontend/

echo ""
echo "4️⃣  Checking if js/app.js exists..."
docker run --rm "$IMAGE_NAME" test -f /app/frontend/js/app.js && echo "   ✓ /app/frontend/js/app.js EXISTS" || echo "   ✗ /app/frontend/js/app.js NOT FOUND"

echo ""
echo "5️⃣  Running container and testing /debug endpoint..."

# Stop any existing container
docker stop "$CONTAINER_NAME" 2>/dev/null || true

# Run container
docker run -d \
    --name "$CONTAINER_NAME" \
    -p 8000:8000 \
    "$IMAGE_NAME"

# Wait for app to start
echo "   Waiting for app to start..."
sleep 3

# Test /debug endpoint
echo ""
echo "   Testing /debug endpoint..."
RESPONSE=$(curl -s http://localhost:8000/debug)

echo "   Response:"
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"

# Extract status
FRONTEND_EXISTS=$(echo "$RESPONSE" | jq -r '.frontend_exists' 2>/dev/null)
JS_APP_EXISTS=$(echo "$RESPONSE" | jq -r '.file_checks.js_app' 2>/dev/null)

echo ""
echo "   Results:"
echo "   - frontend_exists: $FRONTEND_EXISTS"
echo "   - file_checks.js_app: $JS_APP_EXISTS"

# Test static file serving
echo ""
echo "6️⃣  Testing static file serving..."
echo "   GET /index.html"
curl -s -w "Status: %{http_code}\n" http://localhost:8000/ | head -1

echo "   GET /js/app.js"
curl -s -w "Status: %{http_code}\n" http://localhost:8000/js/app.js | head -1

echo "   GET /css/style.css"
curl -s -w "Status: %{http_code}\n" http://localhost:8000/css/style.css | head -1

echo ""
echo "7️⃣  Cleanup..."
docker stop "$CONTAINER_NAME"
docker rm "$CONTAINER_NAME"

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✓ Test Complete"
echo "════════════════════════════════════════════════════════════"

# Summary
echo ""
echo "Summary:"
echo "  Frontend exists: $FRONTEND_EXISTS"
echo "  js/app.js exists: $JS_APP_EXISTS"

if [ "$FRONTEND_EXISTS" = "true" ] && [ "$JS_APP_EXISTS" = "true" ]; then
    echo ""
    echo "✓ Everything looks good! Static files are being served correctly."
    exit 0
else
    echo ""
    echo "✗ Issues detected. Check output above for details."
    exit 1
fi
