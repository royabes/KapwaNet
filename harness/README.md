# KapwaNet Autonomous Harness

**Dedicated harness for building KapwaNet** - Community Platform for Dignified Mutual Aid (Bayanihan).

Built on Claude Agent SDK with autonomous coding, regression testing, and real-time feedback.

---

## Quick Start

### 1. Install Harness Dependencies

```bash
cd /home/orion/Projects/KapwaNet/harness

# Create harness virtual environment (separate from project venv)
python3 -m venv venv
source venv/bin/activate

# Install Claude SDK (only dependency needed for harness)
pip install -r requirements.txt
```

**Note**: The harness has its own venv (`harness/venv/`) with just `claude-code-sdk`. The Django backend will have a separate venv (`.venv/` at project root) or run in Docker. This keeps the autonomous coding tool isolated from application dependencies.

### 2. Verify Prerequisites

```bash
# Python 3.10+
python3 --version

# Node.js 18+
node --version

# Docker
docker --version
docker compose version
```

If Node.js is not installed:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

If Docker is not installed:
```bash
sudo apt-get install docker.io docker-compose-plugin
```

---

## Running All Sprints (Full Build)

### Option 1: Run All Sprints Sequentially

```bash
cd /home/orion/Projects/KapwaNet/harness
source venv/bin/activate

# Sprint 0: Foundation (already complete)
python run_harness.py --sprint 0

# Sprint 1: Styling Engine & Templates
python run_harness.py --sprint 1

# Sprint 2: Core Community Features
python run_harness.py --sprint 2
```

### Option 2: Run All Sprints in One Script

Create and run this script:

```bash
#!/bin/bash
# run_all_sprints.sh

set -e  # Exit on any error

cd /home/orion/Projects/KapwaNet/harness
source venv/bin/activate

echo "=========================================="
echo "Starting KapwaNet Full Build"
echo "=========================================="

for sprint in 0 1 2; do
    echo ""
    echo "=========================================="
    echo "SPRINT $sprint"
    echo "=========================================="

    python run_harness.py --sprint $sprint

    # Run full regression tests after each sprint
    echo "Running regression tests for Sprint $sprint..."
    cd /home/orion/Projects/KapwaNet
    ./scripts/run_tests.sh
    cd /home/orion/Projects/KapwaNet/harness

    echo "Sprint $sprint complete!"
done

echo ""
echo "=========================================="
echo "ALL SPRINTS COMPLETE!"
echo "=========================================="
```

### Option 3: Run with Specific Model

```bash
# Use Opus (most capable, default)
python run_harness.py --sprint 1

# Use Sonnet (faster, cheaper)
python run_harness.py --sprint 1 --model sonnet

# Use Haiku (fastest, cheapest - simple tasks only)
python run_harness.py --sprint 1 --model haiku
```

---

## Testing & Regression Testing

### Test Framework Setup

The harness expects these test commands to be available:

```bash
# Backend tests (Django)
docker compose exec api python manage.py test

# Frontend tests (Next.js)
docker compose exec web npm test

# Full test suite
./scripts/run_tests.sh
```

### Running Tests Manually

```bash
cd /home/orion/Projects/KapwaNet

# 1. Ensure services are running
docker compose up -d

# 2. Wait for services to be healthy
docker compose ps  # All should show "healthy"

# 3. Run backend tests
docker compose exec api python manage.py test --verbosity=2

# 4. Run frontend tests
docker compose exec web npm test

# 5. Run API integration tests
./scripts/test_api.sh

# 6. Run E2E tests (if available)
./scripts/test_e2e.sh
```

### Regression Testing Protocol

After EACH feature is implemented, the harness runs:

1. **Unit Tests**: All model and component tests
2. **API Tests**: All endpoint tests
3. **Integration Tests**: Cross-service tests
4. **Previous Sprint Tests**: All tests from completed sprints

```bash
# What the harness runs after each feature:
docker compose exec api python manage.py test
docker compose exec web npm test
curl -f http://localhost:8000/api/health/
curl -f http://localhost:3000/
```

### Test Categories by Sprint

#### Sprint 0 Tests
```bash
# Health checks
curl http://localhost:8000/api/health/
curl http://localhost:3000/

# Django admin accessible
curl -I http://localhost:8000/admin/  # Should return 302

# JWT endpoints
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}'
```

#### Sprint 1 Tests
```bash
# Organization API
curl http://localhost:8000/api/organizations/
curl http://localhost:8000/api/organizations/test-org/

# Theme API
curl http://localhost:8000/api/organizations/test-org/theme/

# Block rendering (frontend)
# Visit http://localhost:3000/test-blocks and verify all 20 blocks render
```

#### Sprint 2 Tests
```bash
# Help posts
curl http://localhost:8000/api/help-posts/

# Item posts
curl http://localhost:8000/api/item-posts/

# Messaging
curl http://localhost:8000/api/threads/

# Moderation
curl http://localhost:8000/api/moderation/reports/
```

---

## Full Test Script

Create this script at `scripts/run_tests.sh`:

```bash
#!/bin/bash
# scripts/run_tests.sh - Full test suite for KapwaNet

set -e

echo "=========================================="
echo "KapwaNet Test Suite"
echo "=========================================="

cd /home/orion/Projects/KapwaNet

# Ensure services are running
echo "Starting services..."
docker compose up -d

# Wait for healthy status
echo "Waiting for services to be healthy..."
sleep 10

# Check service health
echo ""
echo "=== Service Health ==="
docker compose ps

# Backend tests
echo ""
echo "=== Backend Tests (Django) ==="
docker compose exec -T api python manage.py test --verbosity=2 || {
    echo "Backend tests FAILED!"
    exit 1
}

# Frontend tests
echo ""
echo "=== Frontend Tests (Next.js) ==="
docker compose exec -T web npm test -- --passWithNoTests || {
    echo "Frontend tests FAILED!"
    exit 1
}

# API health check
echo ""
echo "=== API Health Check ==="
curl -f http://localhost:8000/api/health/ || {
    echo "API health check FAILED!"
    exit 1
}

# Frontend health check
echo ""
echo "=== Frontend Health Check ==="
curl -f http://localhost:3000/ > /dev/null || {
    echo "Frontend health check FAILED!"
    exit 1
}

echo ""
echo "=========================================="
echo "ALL TESTS PASSED!"
echo "=========================================="
```

---

## What the Harness Does

### Autonomous Coding:
- Reads feature list (`.claude/sprint{N}_feature_list.json`)
- Implements features one-by-one
- Writes Next.js components, Django models, Docker configs
- Runs `npm`, `docker compose`, `python manage.py`
- Updates feature list (`passes: true` when complete)
- Commits changes to git with clear messages
- Auto-continues to next feature

### Regression Testing (Built-in):
- After each feature: Runs ALL previous tests
- Verifies no regression in functionality
- Only marks feature passing if no regressions
- Documents test results

### Security (Multi-layered):
- **Sandbox**: OS-level bash command isolation
- **Permissions**: File operations restricted to project directory
- **Allowlist**: Only approved bash commands (see `security.py`)
- Allowed: `npm`, `node`, `python`, `docker`, `git`, etc.

---

## Monitoring Progress

### Real-Time Log:
```bash
tail -f /home/orion/Projects/KapwaNet/.claude/sprint0_sdk_output.log
```

### Check Feature Progress:
```bash
# Count completed features
cat .claude/sprint0_feature_list.json | jq '.features | map(select(.passes == true)) | length'

# List incomplete features
cat .claude/sprint1_feature_list.json | jq '.features[] | select(.passes == false) | .id + ": " + .description'
```

### Session History:
```bash
cat .claude/sprint0_history.json | jq
```

---

## Sprint Breakdown

### Sprint 0: Foundation & Repo Setup ✓ COMPLETE
**Goal**: A running skeleton with deployment, no features yet.

**EPICs**:
- S0-A: Repository & Tooling (monorepo, Docker Compose, env config)
- S0-B: Backend Skeleton (Django + Wagtail + auth)
- S0-C: Frontend Skeleton (Next.js + API connectivity)

**Features**: 7 total (all passing)

**Success Criteria**:
- `docker compose up` brings all services up cleanly
- Django admin reachable at `/admin/`
- Frontend loads at `/`
- API health endpoint returns `{"status": "healthy"}`

### Sprint 1: Styling Engine & Templates (Key Differentiator)
**Goal**: Orgs can style and launch a public site using templates.

**EPICs**:
- S1-A: Organization & Theme Models
- S1-B: Styling Engine (Frontend)
- S1-C: Block Renderer (20 block types)
- S1-D: Template Library

**Features**: 12 total

**Success Criteria**:
- Changing theme JSON changes site colors/fonts
- All 20 block types render correctly
- Templates can be cloned into new pages

### Sprint 2: Core Community Features
**Goal**: Enable real bayanihan activity and sharing.

**EPICs**:
- S2-A: Membership & Roles
- S2-B: Bayanihan Help
- S2-C: Item Sharing
- S2-D: Messaging
- S2-E: Moderation

**Features**: 9 total

**Success Criteria**:
- Full help request → match → completion flow works
- Items can be shared with reservations
- Moderation actions logged

---

## File Structure

```
harness/
├── agent.py              # Core agent session logic
├── client.py             # KapwaNet-specific SDK config
├── progress.py           # Progress tracking
├── prompts.py            # Prompt loading
├── security.py           # Security hooks (bash allowlist)
├── requirements.txt      # Claude SDK dependencies
├── run_harness.py        # Main entry point
├── venv/                 # Python virtual environment
├── prompts/              # Sprint coding prompts
│   ├── sprint0_coding.md
│   ├── sprint1_coding.md
│   └── sprint2_coding.md
└── README.md             # This file

scripts/
├── run_tests.sh          # Full test suite
├── test_api.sh           # API integration tests
└── test_e2e.sh           # End-to-end tests
```

---

## Authentication

Uses your existing Claude authentication:
- **Anthropic Max** (preferred - if logged in via `claude-code` CLI)
- **API Key** (set `ANTHROPIC_API_KEY` environment variable)

No additional setup required.

---

## Stopping the Harness

**Graceful stop**:
- Press `Ctrl+C` (progress is saved automatically)

**Force kill** (if stuck):
```bash
pkill -f "run_harness.py"
```

**Resume**:
```bash
python run_harness.py --sprint 1
# Continues from where it left off
```

---

## Troubleshooting

### "claude-code-sdk not installed"
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### "docker not found"
```bash
sudo apt-get install docker.io docker-compose-plugin
```

### "node not found"
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### "Feature stuck / not progressing"
- Check log: `tail -f .claude/sprint1_sdk_output.log`
- Look for errors or blocked commands
- Manually fix if needed, then resume harness

### "Tests failing"
```bash
# Run tests manually to see errors
docker compose exec api python manage.py test --verbosity=2
docker compose exec web npm test
```

### "Too slow / expensive"
```bash
# Use Sonnet instead of Opus
python run_harness.py --sprint 1 --model sonnet
```

---

## Technology Stack

- **Next.js 14+**: React frontend with App Router
- **Django 5.0+**: Backend with Django REST Framework
- **Wagtail**: CMS for content management
- **PostgreSQL 15**: Database
- **Docker Compose**: Container orchestration
- **Tailwind CSS**: Styling
- **Jest**: Frontend testing
- **pytest/Django test**: Backend testing

---

## Next Steps

1. **If Sprint 0 complete**: Run `python run_harness.py --sprint 1`
2. **After each sprint**: Run `./scripts/run_tests.sh`
3. **Review results**: Check `.claude/sprint{N}_feature_list.json`
4. **Continue**: Until all sprints complete

---

**Status**: Ready to build KapwaNet autonomously!

**Model**: Claude Opus 4.5 (default, recommended)

**Philosophy**: Communities already have what they need — they just need the right infrastructure to connect.
