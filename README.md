# GlazedIn

[![CI](https://github.com/Gorbiel/Software_Engineering_Web_Project/actions/workflows/ci.yml/badge.svg)](https://github.com/Gorbiel/Software_Engineering_Web_Project/actions/workflows/ci.yml)
[![CodeQL](https://github.com/Gorbiel/Software_Engineering_Web_Project/actions/workflows/codeql.yml/badge.svg)](https://github.com/Gorbiel/Software_Engineering_Web_Project/actions/workflows/codeql.yml)
[![Dependency Review](https://github.com/Gorbiel/Software_Engineering_Web_Project/actions/workflows/dependency-review.yml/badge.svg)](https://github.com/Gorbiel/Software_Engineering_Web_Project/actions/workflows/dependency-review.yml)
[![Publish Images](https://github.com/Gorbiel/Software_Engineering_Web_Project/actions/workflows/publish-images.yml/badge.svg)](https://github.com/Gorbiel/Software_Engineering_Web_Project/actions/workflows/publish-images.yml)

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Django](https://img.shields.io/badge/Django-6.0-092E20?logo=django&logoColor=white)
![Django REST Framework](https://img.shields.io/badge/DRF-3.17-red)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

GlazedIn is a social recognition platform for teams that want appreciation to be visible, frequent, and easy to share. It gives every team member a dedicated place to celebrate good work, thank teammates, highlight milestones, and build a shared record of positive contributions across an organization.

Created as part of the Software Engineering Course at AGH UST, 2026.

## About The Project

Great work often happens quietly. Someone helps unblock a task, reviews a difficult change, supports a teammate, leads a project forward, or simply makes the day easier for others. In many teams, those moments disappear into chat messages, private conversations, or meeting notes. GlazedIn turns recognition into something visible, searchable, and lasting.

With GlazedIn, users can publish short appreciation posts, react to contributions, showcase achievements, and browse profiles that tell a richer story than a job title alone. The platform is designed for everyday team culture: quick enough for spontaneous praise, structured enough to build history, and social enough to make recognition feel shared rather than hidden.

For teams, GlazedIn creates a lightweight culture layer on top of daily work. It helps people notice who is contributing, who is supporting others, and which achievements deserve attention. For team leaders and admins, it offers a simple way to follow engagement, manage users, and understand activity across teams without turning recognition into a heavy process.

## Why Use GlazedIn?

- **Make appreciation visible:** replace throwaway praise in chat with recognition that teammates can see and revisit.
- **Build stronger team culture:** encourage people to notice helpful work, celebrate progress, and support each other publicly.
- **Highlight real contributions:** give users a profile that reflects achievements, activity, and the positive impact they have on others.
- **Encourage lightweight engagement:** reactions, leaderboards, and activity views make participation quick and approachable.
- **Support managers and admins:** reporting and management screens help track engagement across people and teams.
- **Keep recognition positive and focused:** the platform is built around appreciation, achievements, and team momentum.

## Core Features

- **Glazes:** post quick shout-outs to thank teammates, celebrate helpful work, or call attention to something worth recognizing.
- **Reactions:** respond to glazes and achievements with lightweight feedback that keeps the conversation moving.
- **Achievements:** showcase milestones, accomplishments, and completed goals in a dedicated recognition space.
- **Profiles:** browse user pages that combine personal details, activity, glazes, and achievements.
- **Teams:** organize users into groups and follow activity in a team-oriented context.
- **Leaderboards:** surface active and recognized users through friendly ranking views.
- **Reports:** inspect engagement and activity through general, user, and team reporting screens.
- **Admin tools:** manage users, activation status, ranks, and account details from a dedicated admin area.

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | Next.js, React, TypeScript, Tailwind CSS, Lucide React |
| Backend | Django, Django REST Framework, Simple JWT |
| Database | PostgreSQL |
| Tooling | Docker Compose, Ruff, Black, ESLint, pytest |
| CI/CD | GitHub Actions, CodeQL, GHCR image publishing |

## Repository Structure

```text
.
├── backend/              # Django project and API apps
├── frontend/             # Next.js application
├── database/             # Database-related project files
├── k8s/                  # Kubernetes manifests
├── argocd/               # Argo CD configuration
├── compose.yaml          # Local development stack
└── compose.prod.yaml     # Production-like Compose overrides
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 22, if running the frontend outside Docker
- Python 3.14, if running the backend outside Docker

### Environment

Create a local `.env` file from the example:

```bash
cp .env-example .env
```

The default example values are suitable for local Docker development.

### Run With Docker

```bash
docker compose up --build
```

The app will be available at:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

Stop the development stack with:

```bash
docker compose down
```

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
. .venv/bin/activate
pip install -e .[dev]
python manage.py migrate
python manage.py runserver
```

Useful backend commands:

```bash
make check-lint
make lint
make test
make mock-db
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Useful frontend commands:

```bash
npm run lint
npm run build
```

For local frontend development outside Docker, create `frontend/.env.local` with:

```env
BACKEND_URL=http://localhost:8000
```

## Quality Checks

The CI pipeline runs checks for changed areas of the codebase:

- Backend linting with Ruff.
- Backend formatting checks with Black.
- Backend tests with pytest and PostgreSQL.
- Frontend linting and production build.
- Docker Compose config validation and image builds.
- CodeQL security analysis.
- Dependency review on pull requests.

## Deployment Notes

Container images are published to GitHub Container Registry from the `prod` and `dev` branches. The `dev` publish workflow writes the short commit SHA back to the staging Kustomize overlay so Argo CD sees an immutable image tag change and rolls the staging deployment. The `prod` workflow publishes both `production` and short-SHA tags without committing back to the protected production branch. The repository also includes Kubernetes and Argo CD configuration for deployment-oriented workflows.

## License

This project was created for academic coursework. Add a license file before distributing or reusing it outside that context.
