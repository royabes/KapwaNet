# Agent Instructions

This project uses **Beads** (bd) for AI-agent task tracking. This file provides comprehensive instructions for AI agents working on this codebase.

---

## Project Overview

**KapwaNet** is a community platform for dignified mutual aid (bayanihan). Key technologies:
- **Next.js** - Frontend (apps/web/)
- **Django + Wagtail** - Backend CMS (apps/api/)
- **PostgreSQL** - Database
- **Docker Compose** - Container orchestration

See `CLAUDE.md` for complete project context.

---

## Beads Task Tracking

### Starting a Session

```bash
# 1. See what's ready to work on
bd ready

# 2. Pick a task (unblocked, highest priority first)
bd show <task-id>

# 3. Claim the task
bd update <task-id> --status in_progress
```

### During Work

```bash
# Check task details
bd show <task-id>

# Add a note/update
bd update <task-id> --note "Implemented X, working on Y"

# If blocked, create a sub-task
bd create "Fix dependency issue" -t task --parent <epic-id>
```

### Completing Work

```bash
# 1. Close the task
bd close <task-id> --reason done

# 2. Sync to git
bd sync

# 3. Commit code changes (if any)
git add -A
git commit -m "Description of changes"
git push
```

---

## Sprint Structure

### Sprint 0 - Foundation & Repo Setup

| Epic | Description | Status |
|------|-------------|--------|
| S0-A | Repository & Tooling | Pending |
| S0-B | Backend Skeleton | Pending |
| S0-C | Frontend Skeleton | Pending |

### Sprint 1 - Styling Engine & Templates

| Epic | Description | Status |
|------|-------------|--------|
| S1-A | Organization & Theme Models | Pending |
| S1-B | Styling Engine (Frontend) | Pending |
| S1-C | Block Renderer | Pending |
| S1-D | Template Library | Pending |

### Sprint 2 - Core Community Features

| Epic | Description | Status |
|------|-------------|--------|
| S2-A | Membership & Roles | Pending |
| S2-B | Bayanihan Help | Pending |
| S2-C | Item Sharing | Pending |
| S2-D | Messaging | Pending |
| S2-E | Moderation | Pending |

---

## Key Commands Reference

### Beads Commands

| Command | Description |
|---------|-------------|
| `bd ready` | Show unblocked tasks ready for work |
| `bd list` | List all tasks |
| `bd list --status open` | List open tasks |
| `bd show <id>` | Show task details |
| `bd create "Title" -t task` | Create new task |
| `bd create "Title" -t epic` | Create new epic |
| `bd update <id> --status in_progress` | Start task |
| `bd close <id> --reason done` | Complete task |
| `bd dep add <child> <parent>` | Add dependency |
| `bd dep tree <id>` | Show dependency tree |
| `bd sync` | Sync with git |
| `bd stats` | Show statistics |

### Project Commands

| Command | Description |
|---------|-------------|
| `docker-compose up` | Start all services |
| `docker-compose build` | Rebuild containers |
| `docker-compose exec api python manage.py migrate` | Run migrations |
| `docker-compose exec api python manage.py test` | Run backend tests |
| `docker-compose exec web npm test` | Run frontend tests |

---

## Session Completion Protocol

**MANDATORY: Complete ALL steps before ending a session.**

### 1. Update Task Status
```bash
# Close completed tasks
bd close <task-id> --reason done

# Update in-progress tasks with notes
bd update <task-id> --note "Completed X, remaining: Y"
```

### 2. Create Follow-up Tasks
```bash
# For any remaining work
bd create "Follow-up: complete Z" -t task --parent <epic-id>
```

### 3. Run Quality Gates (if code changed)
```bash
# Docker services up
docker-compose up -d

# Backend tests
docker-compose exec api python manage.py test

# Frontend type check
docker-compose exec web npx tsc --noEmit

# Frontend tests
docker-compose exec web npm test
```

### 4. Commit and Push
```bash
# Stage all changes
git add -A

# Commit with descriptive message
git commit -m "Description of changes"

# Sync beads
bd sync

# PUSH - This is MANDATORY
git pull --rebase
git push

# Verify
git status  # MUST show "up to date with origin"
```

### 5. Handoff Notes

Provide context for the next session:
- What was completed
- What's in progress
- Any blockers or issues
- Recommended next task (`bd ready` output)

---

## Critical Rules

1. **Work is NOT complete until `git push` succeeds**
2. **NEVER stop before pushing** - leaves work stranded locally
3. **NEVER say "ready to push when you are"** - YOU must push
4. **Always use `bd ready`** to find the right task to work on
5. **Update task status** as you work, not just at the end
6. **Create sub-tasks** if work scope expands

---

## Code Locations

| Component | Location |
|-----------|----------|
| Frontend | `apps/web/` |
| Backend API | `apps/api/` |
| Organizations | `apps/api/organizations/` |
| Users | `apps/api/users/` |
| Help Module | `apps/api/help/` |
| Items Module | `apps/api/items/` |
| Messaging | `apps/api/messaging/` |
| Moderation | `apps/api/moderation/` |
| Docker Config | `infra/` |
| Documentation | `docs/` |
| Harness | `harness/` |

---

## Multi-Tenancy Rules

**CRITICAL: Every database query must be scoped to an organization.**

```python
# GOOD - Filtered by org
HelpPost.objects.filter(org_id=request.user.current_org_id)

# BAD - No org filter (data leak!)
HelpPost.objects.all()
```

Always verify:
1. User is authenticated
2. User has membership in the org
3. User has required role for the action
4. User is not suspended

---

## Getting Help

- **Project context**: `CLAUDE.md`
- **Sprint details**: `docs/plan/sprint_0to2.md`
- **PRD**: `docs/plan/prd.md`
- **Architecture**: `docs/plan/architecture.md`
- **Block specs**: `docs/plan/block_renderer.md`
- **Schema**: `docs/plan/schema.md`
- **Beads docs**: https://github.com/steveyegge/beads
