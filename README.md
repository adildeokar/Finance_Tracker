# Finance Tracker — Expense Tracking & Budget Management

A full-stack personal finance application with **JWT authentication**, **Python FastAPI** backend (10 API routers), **React** frontend, and **Supabase** PostgreSQL database.

## Problem Statement

Individuals often lack visibility into their spending habits, making it difficult to control expenses and achieve financial goals. This platform lets users record expenses, categorize transactions, set monthly budgets, generate reports, and visualize spending trends through dashboards.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python 3.11 + FastAPI |
| Auth | JWT (`python-jose` + `passlib[bcrypt]`) |
| Database | Supabase (PostgreSQL) |
| Frontend | React 18 + Vite + Tailwind CSS |
| Charts | Recharts |

## Quick Start

### 1. Database (Supabase)

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run `supabase/schema.sql`
3. Copy your **Project URL** and **service role key** from Settings → API

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your Supabase URL, service role key, and JWT_SECRET

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

## API Routers (10 distinct groups)

| Router | Prefix | Purpose |
|--------|--------|---------|
| Authentication | `/auth` | Register, login, profile, change password |
| Payment Accounts | `/accounts` | Credit cards, savings, wallets CRUD |
| Expenses | `/expenses` | Transaction CRUD, bulk import, CSV export |
| Categories | `/categories` | Colour-coded category CRUD |
| Budgets | `/budgets` | Monthly per-category budget limits |
| Recurring | `/recurring` | Subscriptions/rent templates + auto-apply |
| Goals | `/goals` | Savings goals with progress tracking |
| Reports | `/reports` | Analytics, breakdowns, trends |
| Dashboard | `/dashboard` | Aggregated KPIs snapshot |
| Alerts | `/alerts` | Budget breach warnings |

## Project Structure

```
finance-tracker/
├── backend/          # FastAPI + JWT + Supabase
├── frontend/         # React + Vite + Tailwind
├── supabase/         # schema.sql
└── README.md
```

## Cursor AI Prompt

See `../cursor_prompt_finance_tracker_v2.md` for the full detailed build specification to use with Cursor Agent.

## Demo Flow

1. Register two users — prove data isolation
2. Add payment accounts (credit card + savings)
3. Create colour-coded categories
4. Add expenses linked to accounts
5. Set budgets → trigger alerts
6. View Reports pie chart and Dashboard trends
7. Export CSV from Expenses page
