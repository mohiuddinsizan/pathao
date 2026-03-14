# Pathao Merchant — Order Management System

A full-stack parcel delivery management dashboard for merchants — built as the CSE 326 (Information System Design) final demo project.

**Live Demo:** Login with `rahim.ahmed@gmail.com` / `demo123`

## Tech Stack

| Layer    | Technology                          | Hosting   |
|----------|-------------------------------------|-----------|
| Frontend | React 19 + Vite 7 + Tailwind v4    | Vercel    |
| Backend  | FastAPI (Python 3.11+)              | Render    |
| Database | PostgreSQL 15                       | Supabase  |
| Auth     | JWT (HS256) + bcrypt                | —         |

## Quick Start

```bash
# 1. Clone
git clone https://github.com/smammahdi/isd-pathao.git && cd isd-pathao

# 2. Database — run in Supabase SQL Editor
#    database/001_schema.sql  then  database/002_seed.sql

# 3. Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env              # fill DATABASE_URL, JWT_SECRET
uvicorn app.main:app --reload --port 8001     # → http://localhost:8001

# 4. Frontend
cd ../frontend
npm install
cp .env.example .env              # VITE_API_URL=http://localhost:8001
npm run dev                       # → http://localhost:5173
```

## Project Structure

```
├── frontend/          React merchant dashboard
│   ├── src/
│   │   ├── api/       API client + service modules
│   │   ├── components/  UI components (shadcn/ui + Radix)
│   │   ├── context/   Auth context (JWT)
│   │   ├── pages/     Route pages
│   │   └── ...
│   └── package.json
│
├── backend/           FastAPI application
│   ├── app/
│   │   ├── auth/      JWT + bcrypt + dependencies
│   │   ├── routers/   API route handlers
│   │   ├── schemas/   Pydantic models
│   │   ├── services/  Business logic + DB queries
│   │   └── main.py    App entry point
│   └── tests/         pytest test suite
│
├── database/          SQL scripts + seed data
│   ├── 001_schema.sql   Tables, indexes, triggers (well-documented)
│   ├── 002_seed.sql     Demo data (14 orders)
│   └── seed_realistic.py  Extended data (34 orders)
│
├── plan/              Task assignments per team member
├── CONTRIBUTING.md    Contributor guidelines & reference priority
└── .github/workflows/ CI pipeline
```

## API Endpoints

All protected endpoints require: `Authorization: Bearer <token>`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register merchant |
| POST | `/api/auth/login` | — | Login → JWT token |
| GET | `/api/auth/me` | ✓ | Current merchant info |
| GET | `/api/dashboard/stats` | ✓ | Dashboard statistics |
| GET | `/api/dashboard/recent-orders` | ✓ | Recent 10 orders |

> **Note:** Orders and Stores API endpoints are planned but not yet registered.
> Each team member will implement and register their assigned endpoints.

Interactive API docs: `http://localhost:8001/docs`

## Environment Variables

### Backend (`backend/.env`)

```
DATABASE_URL=postgresql://postgres:password@pooler.supabase.com:5432/postgres
JWT_SECRET=your-random-secret-key
JWT_EXPIRY_HOURS=24
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```
VITE_API_URL=http://localhost:8001
```

## Running Tests

```bash
# Backend
cd backend && python -m pytest tests/ -v

# Frontend
cd frontend && npm test
```

## Demo Credentials

```
Email:    rahim.ahmed@gmail.com
Password: demo123
```

## Team

| Roll    | Responsibility                                                             |
| ------- | -------------------------------------------------------------------------- |
| 2105056 | Project setup, auth (login/JWT), dashboard page, Supabase schema, CI/CD, deployment |
| 2105057 | Order creation flow (backend API + frontend form), payments page           |
| 2105058 | Deliveries page (order listing, filtering, search, pagination)             |
| 2105040 | Order detail view (view detail from dashboard), edit order, analytics page |
| 2105045 | Stores page (CRUD), shared UI components                                   |
| 2105039 | Testing (unit + integration), settings page                                |

## Git Workflow

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

- **`main`** — protected, merge via PR only
- **`<roll-number>`** — your feature branch
- Conventional commits: `feat:`, `fix:`, `style:`, `test:`, `docs:`
