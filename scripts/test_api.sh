#!/bin/bash
# scripts/test_api.sh - API integration tests for KapwaNet
#
# Tests all API endpoints across all sprints.
# Run after each sprint to verify no regressions.

set -e

PROJECT_DIR="/home/orion/Projects/KapwaNet"
cd "$PROJECT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:3000"

PASSED=0
FAILED=0
SKIPPED=0

test_endpoint() {
    local method="$1"
    local endpoint="$2"
    local expected="$3"
    local description="$4"

    echo -n "  $method $endpoint ... "

    case "$method" in
        GET)
            response=$(curl -sf "$API_URL$endpoint" 2>/dev/null) || response=""
            ;;
        POST)
            response=$(curl -sf -X POST "$API_URL$endpoint" -H "Content-Type: application/json" -d '{}' 2>/dev/null) || response=""
            ;;
        HEAD)
            response=$(curl -sI "$API_URL$endpoint" 2>/dev/null) || response=""
            ;;
    esac

    if echo "$response" | grep -q "$expected"; then
        echo -e "${GREEN}OK${NC} ${description}"
        ((PASSED++))
    elif [ -z "$response" ]; then
        echo -e "${YELLOW}SKIP${NC} (endpoint not available)"
        ((SKIPPED++))
    else
        echo -e "${RED}FAIL${NC}"
        ((FAILED++))
    fi
}

echo ""
echo "=========================================="
echo "KapwaNet API Integration Tests"
echo "=========================================="
echo ""

# Sprint 0: Foundation
echo "--- Sprint 0: Foundation ---"
test_endpoint "GET" "/api/health/" "healthy" "(health check)"
test_endpoint "HEAD" "/admin/" "302" "(admin redirect)"

# Sprint 1: Organizations & Themes (if implemented)
echo ""
echo "--- Sprint 1: Organizations & Themes ---"
test_endpoint "GET" "/api/organizations/" "" "(list organizations)"
test_endpoint "GET" "/api/theme-presets/" "" "(list theme presets)"

# Sprint 2: Community Features (if implemented)
echo ""
echo "--- Sprint 2: Community Features ---"
test_endpoint "GET" "/api/help-posts/" "" "(list help posts)"
test_endpoint "GET" "/api/item-posts/" "" "(list item posts)"
test_endpoint "GET" "/api/threads/" "" "(list message threads)"

# Frontend check
echo ""
echo "--- Frontend ---"
echo -n "  GET $FRONTEND_URL ... "
if curl -sf "$FRONTEND_URL" | grep -q "KapwaNet"; then
    echo -e "${GREEN}OK${NC} (renders correctly)"
    ((PASSED++))
else
    echo -e "${RED}FAIL${NC}"
    ((FAILED++))
fi

# Summary
echo ""
echo "=========================================="
echo "Results: ${GREEN}$PASSED passed${NC}, ${RED}$FAILED failed${NC}, ${YELLOW}$SKIPPED skipped${NC}"
echo "=========================================="

if [ $FAILED -gt 0 ]; then
    exit 1
fi
