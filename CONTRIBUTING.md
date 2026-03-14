# Contributing to Pathao Merchant

Quick reference for all team members. Read this before writing any code.

---

## 1. Setup

```bash
# Clone & enter
git clone https://github.com/smammahdi/isd-pathao.git
cd isd-pathao

# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env      # fill DATABASE_URL, JWT_SECRET

# Frontend
cd ../frontend
npm install
cp .env.example .env      # set VITE_API_URL=http://localhost:8000/api

# Database
# Open Supabase SQL Editor → run database/001_schema.sql then 002_seed.sql
```

## 2. Branch Rules

| Branch | Purpose | Who pushes |
|--------|---------|------------|
| `main` | Production-ready | PR merge only |
| `<roll-number>` | Your feature work | You |

```bash
git checkout -b 2105057          # use your roll number
git push -u origin 2105057
```

**Never push directly to `main`.** Always create a Pull Request.

## 3. Commit Messages

Use conventional commits:

```
feat: add order creation endpoint
fix: correct pagination offset calculation
style: update card border radius
test: add dashboard stats tests
docs: update API endpoint table
refactor: extract order validation logic
```

## 4. Pull Request Checklist

Before opening a PR:

- [ ] Code runs locally without errors
- [ ] Backend tests pass: `cd backend && python -m pytest tests/ -v`
- [ ] Frontend builds: `cd frontend && npm run build`
- [ ] No console errors in the browser
- [ ] PR description explains **what** and **why**

## 5. Project References

When implementing features, follow these sources in this priority order:

| Priority | Source | Location | What it covers |
|----------|--------|----------|----------------|
| 1 | **Database schema** | `database/001_schema.sql` | Table structure, constraints, relationships |
| 2 | **API plan** | `plan/general.txt` → API ENDPOINTS section | All endpoint signatures, request/response shapes |
| 3 | **Your task file** | `plan/<your-roll>.txt` | Step-by-step implementation guide for your feature |
| 4 | **Existing code** | `backend/app/routers/`, `frontend/src/` | Patterns used by other team members |
| 5 | **Design system** | `plan/general.txt` → DESIGN SYSTEM section | Colors, typography, spacing (reference only — UI is already built) |

## 6. Architecture

```
Frontend (React 19 + Vite)
    ↓  REST API + JWT Bearer token
Backend (FastAPI + asyncpg)
    ↓  SQL queries (no ORM)
Supabase (PostgreSQL 15)
```

- **Frontend** → `frontend/src/api/*.js` for all API calls
- **Backend** → `backend/app/routers/*.py` for endpoints, `/services/*.py` for business logic
- **Database** → Raw SQL via asyncpg (no SQLAlchemy/ORM)
- **Auth** → JWT tokens stored in localStorage, sent as `Authorization: Bearer <token>`

## 7. File Naming Conventions

| Layer | Convention | Example |
|-------|-----------|---------|
| Backend routers | lowercase, plural noun | `orders.py`, `stores.py` |
| Backend services | lowercase, `_service` suffix | `auth_service.py` |
| Backend schemas | lowercase, module name | `auth.py` in `schemas/` |
| Frontend pages | PascalCase, `Page` suffix | `DashboardPage.jsx` |
| Frontend API | camelCase | `dashboard.js`, `orders.js` |
| Frontend components | PascalCase | `AppShell.jsx`, `StatusBadge.jsx` |

## 8. Environment Variables

### Backend (`backend/.env`)

```
DATABASE_URL=postgresql://postgres.xxx:password@pooler.supabase.com:5432/postgres
JWT_SECRET=any-random-string-at-least-32-chars
JWT_EXPIRY_HOURS=24
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```
VITE_API_URL=http://localhost:8000/api
```

## 9. Running Tests

```bash
# Backend (pytest)
cd backend
python -m pytest tests/ -v

# Frontend (vitest)
cd frontend
npm test
```

## 10. Key Gotchas

1. **Supabase pooler uses PgBouncer** — don't wrap queries in `BEGIN`/`COMMIT` transaction blocks. Individual statements work fine.
2. **RLS is disabled** in the schema for simplicity. Don't enable it unless you know what you're doing.
3. **Password hashing** uses bcrypt via passlib. The demo password is `demo123`.
4. **Order IDs** use a sequence (`PTH-100001`, `PTH-100002`...) — see `order_id_seq` in the schema.
5. **All order/store endpoints are merchant-scoped** — they filter by `merchant_id` from the JWT token automatically.
