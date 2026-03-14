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

## User Role

This application serves a single user role: **Merchant** — a business owner who ships parcels through Pathao.

All routes require authentication (JWT). Unauthenticated users are redirected to `/login`.

## Application Pages

| Route | Page | Status | Description |
|-------|------|--------|-------------|
| `/dashboard` | Dashboard | ✅ Live | Stats overview: Total Parcels, Total Income, Success Rate, Active Stores. Each card links to its respective page. Recent Activity table with last 10 orders. |
| `/deliveries` | Deliveries | 🚧 In Progress | Full order list with filters, pagination, status tracking. Create new parcel via top-right button. |
| `/deliveries/new` | Create Parcel | 🚧 In Progress | Parcel creation form: recipient, pickup store, weight, COD amount. |
| `/stores` | Stores | 🚧 In Progress | Manage merchant store locations (add, edit, set default). |
| `/analytics` | Analytics | 🚧 In Progress | Delivery performance charts: success rate trends, status breakdown, revenue over time. |
| `/payments` | Payments | 🚧 In Progress | Income history, COD collected, pending payouts. |
| `/settings` | Settings | 🚧 In Progress | Merchant profile and account settings. |

## API Endpoints

All protected endpoints require: `Authorization: Bearer <token>`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register merchant |
| POST | `/api/auth/login` | — | Login → JWT token |
| GET | `/api/auth/me` | ✓ | Current merchant info |
| GET | `/api/orders` | ✓ | List orders (paginated, filterable) |
| POST | `/api/orders` | ✓ | Create new order |
| GET | `/api/orders/{id}` | ✓ | Order detail + status timeline |
| PATCH | `/api/orders/{id}/cancel` | ✓ | Cancel order |
| GET | `/api/stores` | ✓ | List merchant stores |
| POST | `/api/stores` | ✓ | Create store |
| PUT | `/api/stores/{id}` | ✓ | Update store |
| GET | `/api/dashboard/stats` | ✓ | Dashboard statistics |
| GET | `/api/dashboard/recent-orders` | ✓ | Recent 10 orders |

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

| Roll    | Responsibility |
|---------|----------------|
| 2105056 | Project setup, auth, Supabase, deployment |
| 2105057 | Order creation (backend + frontend) |
| 2105058 | Order listing, filtering, pagination |
| 2105040 | Order detail, edit, cancel |
| 2105045 | Dashboard, stores, UI components |
| 2105039 | Testing (unit + integration) |

## Git Workflow

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

- **`main`** — protected, merge via PR only
- **`<roll-number>`** — your feature branch
- Conventional commits: `feat:`, `fix:`, `style:`, `test:`, `docs:`
