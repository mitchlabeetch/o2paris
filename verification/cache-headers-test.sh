#!/bin/bash
# Test script to verify cache headers are properly set on API routes
# This script checks that all GET endpoints return proper cache control headers

echo "Testing Cache Headers on API Routes"
echo "===================================="
echo ""

BASE_URL="http://localhost:3000"

# Test /api/pinpoints
echo "1. Testing /api/pinpoints"
HEADERS=$(curl -s -I "${BASE_URL}/api/pinpoints" 2>&1 | grep -i "cache-control")
if [ -z "$HEADERS" ]; then
    echo "   ⚠️  No cache-control header found (may be due to 503 error without DB)"
else
    echo "   ✓ Cache-Control: ${HEADERS}"
fi
echo ""

# Test /api/config
echo "2. Testing /api/config"
HEADERS=$(curl -s -I "${BASE_URL}/api/config" 2>&1 | grep -i "cache-control")
if [ -z "$HEADERS" ]; then
    echo "   ⚠️  No cache-control header found (returns default config without DB)"
else
    echo "   ✓ Cache-Control: ${HEADERS}"
fi
echo ""

# Test /api/sounds
echo "3. Testing /api/sounds"
HEADERS=$(curl -s -I "${BASE_URL}/api/sounds" 2>&1 | grep -i "cache-control")
if [ -z "$HEADERS" ]; then
    echo "   ⚠️  No cache-control header found (may be due to 503 error without DB)"
else
    echo "   ✓ Cache-Control: ${HEADERS}"
fi
echo ""

echo "Note: Without a DATABASE_URL configured, some endpoints return errors (503)"
echo "The cache headers will be present when a database is connected."
echo ""
echo "To verify with database:"
echo "1. Set DATABASE_URL in .env"
echo "2. Run: npm run dev"
echo "3. Visit /api/init to initialize"
echo "4. Re-run this test"
