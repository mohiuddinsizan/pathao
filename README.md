# Pathao Order Management System

A full-stack delivery order management dashboard for merchants — built as the CSE 326 (Information System Design) final demo project.

**Feature:** Order Creation & Management

## Tech Stack

| Layer    | Technology                   | Hosting       |
|----------|------------------------------|---------------|
| Frontend | React 19 + Vite + React Router v7 | Vercel   |
| Backend  | FastAPI (Python 3.11+)       | Render        |
| Database | PostgreSQL                   | Supabase      |
| Auth     | JWT (custom)                 | —             |

## Project Structure

```
├── frontend/          React merchant dashboard
│   ├── src/
│   │   ├── api/       Axios client + API service modules
│   │   ├── components/  Shared UI components
│   │   ├── context/   Auth context (JWT)
│   │   ├── hooks/     Data fetching hooks
│   │   ├── pages/     Route pages
│   │   ├── styles/    CSS variables + global styles
│   │   └── utils/     Constants, helpers
│   └── package.json
│
├── backend/           FastAPI application
│   ├── app/
│   │   ├── auth/      JWT + password hashing + dependencies
│   │   ├── routers/   API route handlers
│   │   ├── schemas/   Pydantic request/response models
│   │   ├── services/  Business logic + DB queries
│   │   ├── config.py  Environment config
│   │   ├── database.py  Connection pool
│   │   └── main.py    App entry point
│   ├── tests/         pytest test suite
│   └── requirements.txt
│
├── database/          SQL scripts
│   ├── 001_schema.sql   Table definitions
│   └── 002_seed.sql     Demo data
│
└── plan/              Task assignments per team member
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- A Supabase project (for PostgreSQL)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # Fill in your values
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`. Docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env             # Set VITE_API_URL
npm run dev
```

The app runs at `http://localhost:5173`.

### Database

Run the SQL files in order on your Supabase SQL Editor:

1. `database/001_schema.sql` — creates tables, indexes, sequence
2. `database/002_seed.sql` — inserts demo merchant, stores, drivers, orders

## Environment Variables

### Backend (.env)

```
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
JWT_SECRET=your-random-secret-key
JWT_EXPIRY_HOURS=24
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:8000/api
```

## API Overview

| Method | Endpoint                      | Description            |
|--------|-------------------------------|------------------------|
| POST   | `/api/auth/register`          | Register merchant      |
| POST   | `/api/auth/login`             | Login                  |
| GET    | `/api/auth/me`                | Current merchant info  |
| GET    | `/api/orders`                 | List orders (filtered) |
| POST   | `/api/orders`                 | Create order           |
| GET    | `/api/orders/{id}`            | Order detail           |
| PUT    | `/api/orders/{id}`            | Update order           |
| PATCH  | `/api/orders/{id}/status`     | Change order status    |
| DELETE | `/api/orders/{id}`            | Cancel order           |
| GET    | `/api/stores`                 | List stores            |
| POST   | `/api/stores`                 | Create store           |
| PUT    | `/api/stores/{id}`            | Update store           |
| DELETE | `/api/stores/{id}`            | Deactivate store       |
| GET    | `/api/dashboard/stats`        | Dashboard statistics   |

## Demo Credentials

After running seed data:

```
Email:    demo@pathao.com
Password: demo123
```

## Team

| Roll     | Responsibility                              |
|----------|---------------------------------------------|
| 2105056  | Project setup, auth, Supabase, deployment   |
| 2105057  | Order creation (backend + frontend)         |
| 2105058  | Order listing, filtering, pagination        |
| 2105040  | Order detail, edit, cancel, status sim      |
| 2105045  | Dashboard, stores, UI components            |
| 2105039  | Testing (unit + integration + E2E)          |

## Git Workflow

- `main` — protected, merge via PR only
- `develop` — integration branch
- `feature/{roll}-{description}` — per-member branches
- Conventional commits: `feat:`, `fix:`, `style:`, `test:`, `docs:`
