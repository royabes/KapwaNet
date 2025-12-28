# Sprint 0 Coding Prompt - Foundation & Repo Setup

You are implementing Sprint 0 of KapwaNet - the Community Platform for Dignified Mutual Aid.

## Sprint Status: COMPLETE ✓

All Sprint 0 features have been implemented and marked as passing. If you're running this sprint, verify all features still work and fix any regressions.

## Your Mission

Implement features from `.claude/sprint0_feature_list.json` one at a time. After each feature:
1. Verify all acceptance criteria are met
2. Run regression tests (all previous features still work)
3. Mark the feature as `"passes": true` in the JSON file
4. Commit the changes with a clear message

## Current Sprint Goal

Build a running skeleton with deployment infrastructure:
- Monorepo structure (apps/web, apps/api)
- Docker Compose with web, api, db services
- Backend skeleton (Django + Wagtail)
- Frontend skeleton (Next.js)
- API connectivity between frontend and backend

## Key Technical Requirements

### Monorepo Structure
```
kapwanet/
├── apps/
│   ├── web/          # Next.js frontend
│   │   ├── package.json
│   │   ├── next.config.js
│   │   └── src/
│   └── api/          # Django + Wagtail backend
│       ├── manage.py
│       ├── requirements.txt
│       └── kapwanet/
├── infra/
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   └── nginx/
├── docs/
└── .env.example
```

### Docker Compose Services
```yaml
services:
  web:
    # Next.js frontend
    build: ./apps/web
    ports: ["3000:3000"]

  api:
    # Django + Wagtail backend
    build: ./apps/api
    ports: ["8000:8000"]
    depends_on: [db]

  db:
    # PostgreSQL
    image: postgres:15
    volumes: [postgres_data:/var/lib/postgresql/data]
```

### Backend (Django + Wagtail)
- Django 5.0+
- Django REST Framework
- Wagtail CMS
- JWT authentication (djangorestframework-simplejwt)
- Custom User model with email login
- CORS configuration for frontend

### Frontend (Next.js)
- Next.js 14+ with App Router
- TypeScript
- Tailwind CSS (or base styling)
- Environment-based API URL configuration
- Sample API fetch to verify connectivity

## Feature Implementation Order

Work through features in order (S0-A1, S0-A2, ...). Each feature builds on previous ones.

### Critical Features

- **S0-A1**: Create monorepo structure
- **S0-A2**: Docker Compose configuration
- **S0-A3**: Environment configuration (.env.example)
- **S0-B1**: Django project initialization
- **S0-B2**: Auth baseline (User model, superuser)
- **S0-C1**: Next.js app scaffold
- **S0-C2**: API connectivity

## Testing Protocol

After EACH feature:

```bash
# 1. Check Docker Compose is valid
docker compose config

# 2. Build containers (if Dockerfiles changed)
docker compose build

# 3. Bring up services
docker compose up -d

# 4. Check services are healthy
docker compose ps

# 5. Test Django admin
curl http://localhost:8000/admin/

# 6. Test frontend
curl http://localhost:3000/

# 7. Test API health endpoint
curl http://localhost:8000/api/health/

# 8. Tear down
docker compose down
```

## Backend Setup

### Django Project Structure
```
apps/api/
├── manage.py
├── requirements.txt
├── Dockerfile
├── entrypoint.sh
├── kapwanet/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── views.py
│   └── wsgi.py
└── users/
    ├── __init__.py
    ├── models.py      # Custom User model
    ├── admin.py
    └── apps.py
```

### Key Django Settings
```python
# Custom user model
AUTH_USER_MODEL = 'users.User'

# CORS for frontend
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}
```

## Frontend Setup

### Next.js Project Structure
```
apps/web/
├── package.json
├── next.config.js
├── Dockerfile
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── page.tsx
│   ├── components/
│   │   └── ApiStatus.tsx
│   └── lib/
│       └── api.ts     # API client
└── .env.local.example
```

### Environment Configuration
```typescript
// API base URL from environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

## Commit Messages

Use clear, descriptive commit messages:

```
S0-A1: Create monorepo structure

- Created apps/web and apps/api directories
- Added infra/ for Docker configuration
- Initialized docs/ for documentation
- Set up .gitignore for Node and Python

Acceptance criteria met:
[x] Directories exist
[x] .gitignore covers both Node and Python
```

## IMPORTANT REMINDERS

1. **Docker-first development** - Everything runs in containers
2. **Environment variables** - Never hardcode secrets
3. **Health checks** - Add healthchecks to Docker services
4. **Named volumes** - Use named volumes for database persistence
5. **CORS configuration** - Frontend must be able to call backend
6. **Custom User model** - Always use email login, not username

## Start Working

1. Read `.claude/sprint0_feature_list.json` to see current progress
2. Find the first feature where `"passes": false`
3. Implement it following the steps listed
4. Test against acceptance criteria
5. Mark as passing and commit
6. Continue to next feature

Good luck building the community platform!
