# KapwaNet

**Community platform for dignified mutual aid, rooted in the Filipino concept of *kapwa* (shared humanity).**

KapwaNet enables organizations to run **bayanihan (mutual aid)**, share essential goods, and build community connections through a branded, easy-to-deploy digital platform.

<p align="center">
  <img src="desktop.png" alt="KapwaNet Desktop View" width="800"/>
</p>

<p align="center">
  <img src="mobile.png" alt="KapwaNet Mobile View" width="300"/>
</p>

## Key Principles

- **"There is no giver. There is no receiver. There is only the flow."**
- **Dignity-centered** — Not charity; mutual exchange between equals
- **Peer-to-peer** — Platform infrastructure, not a service provider
- **Community-owned** — Open-source (AGPL-3.0), self-hostable
- **Organization-first** — Each community runs their own branded instance

---

## Features

### For Community Members
- **Invitations** — Request help or offer assistance to neighbors
- **Gifts** — Share items (food, clothing, household goods) with the community
- **Messages** — Private coordination between matched members
- **Activity Feed** — See what's happening in your community
- **Notifications** — Stay updated on your posts and messages
- **Search** — Find posts, members, and pages across the community

### For Organizations
- **Admin Dashboard** — Manage members, moderate content, view analytics
- **Theming System** — Customize colors, fonts, and branding
- **Page Builder** — Create custom pages with 20+ block types
- **PWA Support** — Install as an app on mobile and desktop
- **Multi-tenant** — One codebase, many communities

---

## Quick Start

### Prerequisites

- **Node.js 18+** (for frontend)
- **Python 3.10+** (for backend)
- **PostgreSQL** (or Docker)
- **Docker & Docker Compose** (recommended)

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/royabes/KapwaNet.git
cd KapwaNet

# Start all services
docker-compose up --build

# Services will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - Admin: http://localhost:8000/admin/
```

### Option 2: Local Development

```bash
# Clone the repository
git clone https://github.com/royabes/KapwaNet.git
cd KapwaNet

# Backend setup
cd apps/api
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Frontend setup (new terminal)
cd apps/web
npm install
npm run dev
```

### Option 3: Frontend Only (Quick Demo)

```bash
cd apps/web
npm install
npm run dev
# Visit http://localhost:3000
```

---

## Project Structure

```
kapwanet/
├── apps/
│   ├── web/              # Next.js 14 frontend
│   │   ├── src/
│   │   │   ├── app/      # App router pages
│   │   │   ├── components/
│   │   │   └── contexts/ # React contexts
│   │   └── public/       # Static assets, PWA manifest
│   └── api/              # Django backend
│       ├── kapwanet/     # Django project settings
│       ├── organizations/
│       ├── users/
│       ├── help/         # Invitations/help posts
│       ├── items/        # Gift/item posts
│       └── messaging/
├── infra/                # Docker, nginx configs
└── docs/                 # Additional documentation
```

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Django 5.0, Django REST Framework |
| Database | PostgreSQL |
| Auth | JWT (djangorestframework-simplejwt) |
| PWA | Service Worker, Web App Manifest |
| Deployment | Docker Compose, Nginx |

---

## Pages & Navigation

| Page | Path | Description |
|------|------|-------------|
| Home | `/` | Community dashboard |
| Explore | `/explore` | Browse all content |
| Invitations | `/invitations` | Help requests and offers |
| Gifts | `/gifts` | Items being shared |
| Messages | `/messages` | Private conversations |
| Profile | `/profile` | Your profile and activity |
| Notifications | `/notifications` | Updates and alerts |
| Activity | `/activity` | Community activity feed |
| Search | `/search` | Global search |
| Settings | `/settings` | Account preferences |
| Help | `/help` | User guide |
| Philosophy | `/philosophy` | Our principles |
| Admin | `/admin` | Organization dashboard |

---

## For Organizations

KapwaNet is designed to be deployed by **community organizations**:

- Churches and faith communities
- Neighborhood associations
- Mutual aid organizations
- Community centers
- Housing cooperatives
- Cultural organizations

Each organization gets their own branded instance with:
- Custom domain support
- Theme customization (colors, fonts, logo)
- Member management
- Content moderation tools
- Analytics dashboard

---

## Environment Variables

Create a `.env` file in the project root:

```bash
# Django Backend
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=postgres://user:password@localhost:5432/kapwanet

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Contributing

We welcome contributions! KapwaNet is open source under the AGPL-3.0 license.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Philosophy

Read our full philosophy: [PHILOSOPHY.md](PHILOSOPHY.md)

> *"Hindi ko kayang maging tao kung wala kayo."*
> "I cannot be human without you."

KapwaNet is built on the belief that communities already have what they need — they just need the right infrastructure to connect. We reject the giver/receiver divide of traditional charity. Everyone gives. Everyone receives. The gift flows in all directions.

---

## License

**AGPL-3.0** — This means:
- You can use, modify, and distribute this software
- If you run a modified version as a service, you must share your changes
- Improvements remain open for all communities

See [LICENSE](LICENSE) for the full text.

---

## Support

- **Issues**: [GitHub Issues](https://github.com/royabes/KapwaNet/issues)
- **Discussions**: [GitHub Discussions](https://github.com/royabes/KapwaNet/discussions)

---

*KapwaNet: Because communities already have what they need — they just need the right infrastructure to connect.*
