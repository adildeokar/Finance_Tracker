import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.auth.auth_routes import router as auth_router
from backend.routes.accounts import router as accounts_router
from backend.routes.alerts import router as alerts_router
from backend.routes.budgets import router as budgets_router
from backend.routes.categories import router as categories_router
from backend.routes.dashboard import router as dashboard_router
from backend.routes.expenses import router as expenses_router
from backend.routes.goals import router as goals_router
from backend.routes.recurring import router as recurring_router
from backend.routes.reports import router as reports_router

app = FastAPI(
    title="Finance Tracker API",
    description="""
    JWT-secured FastAPI backend for Personal Expense Tracking & Budget Management.
    All routes (except /auth/register and /auth/login) require a Bearer JWT token.
    Each user's data is fully isolated by user_id extracted from the token.
    """,
    version="2.0.0",
)

frontend_origins = [o.strip() for o in os.getenv("FRONTEND_ORIGINS", "http://localhost:5173").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(accounts_router)
app.include_router(expenses_router)
app.include_router(categories_router)
app.include_router(budgets_router)
app.include_router(recurring_router)
app.include_router(goals_router)
app.include_router(reports_router)
app.include_router(dashboard_router)
app.include_router(alerts_router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "Finance Tracker API v2 is running", "docs": "/docs", "total_routers": 10}
