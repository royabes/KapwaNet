#!/bin/bash
# scripts/run_all_sprints.sh - Run all sprints with regression testing
#
# Usage:
#   ./scripts/run_all_sprints.sh           # Run all sprints (0, 1, 2)
#   ./scripts/run_all_sprints.sh --from 1  # Start from sprint 1
#   ./scripts/run_all_sprints.sh --model sonnet  # Use Sonnet model

set -e

PROJECT_DIR="/home/orion/Projects/KapwaNet"
HARNESS_DIR="$PROJECT_DIR/harness"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Default values
START_SPRINT=0
MODEL="opus"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --from)
            START_SPRINT="$2"
            shift 2
            ;;
        --model)
            MODEL="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--from SPRINT] [--model MODEL]"
            exit 1
            ;;
    esac
done

echo ""
echo -e "${CYAN}=========================================="
echo "KapwaNet Full Build"
echo "==========================================${NC}"
echo "Starting from Sprint: $START_SPRINT"
echo "Model: $MODEL"
echo ""

# Activate harness venv
cd "$HARNESS_DIR"
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating harness virtual environment...${NC}"
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Run each sprint
for sprint in 0 1 2; do
    if [ $sprint -lt $START_SPRINT ]; then
        echo -e "${YELLOW}Skipping Sprint $sprint (starting from $START_SPRINT)${NC}"
        continue
    fi

    echo ""
    echo -e "${CYAN}=========================================="
    echo "SPRINT $sprint"
    echo "==========================================${NC}"

    # Check if sprint is already complete
    FEATURE_FILE="$PROJECT_DIR/.claude/sprint${sprint}_feature_list.json"
    if [ -f "$FEATURE_FILE" ]; then
        INCOMPLETE=$(cat "$FEATURE_FILE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(len([f for f in d['features'] if not f['passes']]))")
        if [ "$INCOMPLETE" = "0" ]; then
            echo -e "${GREEN}Sprint $sprint already complete!${NC}"
            echo "Running regression tests..."
            cd "$PROJECT_DIR"
            ./scripts/run_tests.sh || {
                echo -e "${RED}Regression tests failed for Sprint $sprint!${NC}"
                exit 1
            }
            cd "$HARNESS_DIR"
            continue
        fi
    fi

    # Run harness for this sprint
    echo "Running harness for Sprint $sprint..."
    python run_harness.py --sprint $sprint --model $MODEL || {
        echo -e "${RED}Sprint $sprint FAILED!${NC}"
        exit 1
    }

    # Run regression tests after sprint
    echo ""
    echo -e "${CYAN}Running regression tests for Sprint $sprint...${NC}"
    cd "$PROJECT_DIR"
    ./scripts/run_tests.sh || {
        echo -e "${RED}Regression tests failed after Sprint $sprint!${NC}"
        exit 1
    }
    cd "$HARNESS_DIR"

    echo -e "${GREEN}Sprint $sprint complete!${NC}"
done

echo ""
echo -e "${GREEN}=========================================="
echo "ALL SPRINTS COMPLETE!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Review the code: git log --oneline"
echo "  2. Test manually: docker compose up"
echo "  3. Visit: http://localhost:3000"
echo ""
