import calendar
from collections import defaultdict
from datetime import date

from fastapi import APIRouter, Depends, Request

from backend.auth.jwt_bearer import jwt_bearer
from backend.database import supabase

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"], dependencies=[Depends(jwt_bearer)])


def date_range(month, year):
    last_day = calendar.monthrange(year, month)[1]
    return f"{year}-{month:02d}-01", f"{year}-{month:02d}-{last_day}"


@router.get("/monthly-summary", summary="Total income vs expenses vs savings for a given month")
async def monthly_summary(request: Request, month: int, year: int):
    fd, td = date_range(month, year)
    result = (
        supabase.table("expenses")
        .select("type, amount")
        .eq("user_id", request.state.user_id)
        .gte("date", fd)
        .lte("date", td)
        .execute()
    )
    income = sum(r["amount"] for r in result.data if r["type"] == "income")
    expense = sum(r["amount"] for r in result.data if r["type"] == "expense")
    return {
        "month": month,
        "year": year,
        "total_income": round(income, 2),
        "total_expenses": round(expense, 2),
        "net_savings": round(income - expense, 2),
        "savings_rate": round(((income - expense) / income) * 100, 1) if income > 0 else 0,
        "transaction_count": len(result.data),
    }


@router.get("/category-breakdown", summary="Expense totals grouped by category — used for pie/donut charts")
async def category_breakdown(request: Request, month: int, year: int, type: str = "expense"):
    fd, td = date_range(month, year)
    result = (
        supabase.table("expenses")
        .select("amount, category_id, categories(name, color, icon)")
        .eq("user_id", request.state.user_id)
        .eq("type", type)
        .gte("date", fd)
        .lte("date", td)
        .execute()
    )

    breakdown = defaultdict(lambda: {"total": 0, "count": 0, "name": "Uncategorised", "color": "#94a3b8", "icon": "❓"})
    total_all = sum(r["amount"] for r in result.data)

    for r in result.data:
        cid = r["category_id"] or "uncategorised"
        breakdown[cid]["total"] += r["amount"]
        breakdown[cid]["count"] += 1
        if r.get("categories"):
            breakdown[cid]["name"] = r["categories"]["name"]
            breakdown[cid]["color"] = r["categories"]["color"]
            breakdown[cid]["icon"] = r["categories"]["icon"]

    return [
        {
            "category_id": k,
            **v,
            "total": round(v["total"], 2),
            "percentage": round((v["total"] / total_all) * 100, 1) if total_all > 0 else 0,
        }
        for k, v in sorted(breakdown.items(), key=lambda x: x[1]["total"], reverse=True)
    ]


@router.get("/budget-vs-actual", summary="Compare budget limits to actual spending per category")
async def budget_vs_actual(request: Request, month: int, year: int):
    fd, td = date_range(month, year)
    budgets = (
        supabase.table("budgets")
        .select("*, categories(name, color, icon)")
        .eq("user_id", request.state.user_id)
        .eq("month", month)
        .eq("year", year)
        .execute()
    )
    expenses = (
        supabase.table("expenses")
        .select("amount, category_id")
        .eq("user_id", request.state.user_id)
        .eq("type", "expense")
        .gte("date", fd)
        .lte("date", td)
        .execute()
    )

    actuals = defaultdict(float)
    for e in expenses.data:
        if e["category_id"]:
            actuals[e["category_id"]] += e["amount"]

    return [
        {
            "category": b["categories"],
            "budget_limit": b["monthly_limit"],
            "alert_threshold": b["alert_threshold"],
            "actual_spent": round(actuals.get(b["category_id"], 0), 2),
            "remaining": round(b["monthly_limit"] - actuals.get(b["category_id"], 0), 2),
            "percentage_used": round((actuals.get(b["category_id"], 0) / b["monthly_limit"]) * 100, 1) if b["monthly_limit"] > 0 else 0,
            "over_budget": actuals.get(b["category_id"], 0) > b["monthly_limit"],
            "at_threshold": (actuals.get(b["category_id"], 0) / b["monthly_limit"]) * 100 >= b["alert_threshold"] if b["monthly_limit"] > 0 else False,
        }
        for b in budgets.data
    ]


@router.get("/6-month-trend", summary="Monthly income, expense and savings totals for the last 6 months")
async def six_month_trend(request: Request):
    today = date.today()
    trend = []
    for i in range(5, -1, -1):
        month = (today.month - i - 1) % 12 + 1
        year = today.year - ((today.month - i - 1) // 12)
        fd, td = date_range(month, year)
        result = (
            supabase.table("expenses")
            .select("type, amount")
            .eq("user_id", request.state.user_id)
            .gte("date", fd)
            .lte("date", td)
            .execute()
        )
        income = sum(r["amount"] for r in result.data if r["type"] == "income")
        expense = sum(r["amount"] for r in result.data if r["type"] == "expense")
        trend.append({
            "month": f"{calendar.month_abbr[month]} {year}",
            "income": round(income, 2),
            "expenses": round(expense, 2),
            "savings": round(income - expense, 2),
        })
    return trend


@router.get("/account-breakdown", summary="Expenses grouped by payment account for a given month")
async def account_breakdown(request: Request, month: int, year: int):
    fd, td = date_range(month, year)
    result = (
        supabase.table("expenses")
        .select("amount, type, account_id, accounts(name, type, color, last_four)")
        .eq("user_id", request.state.user_id)
        .gte("date", fd)
        .lte("date", td)
        .execute()
    )

    breakdown = defaultdict(lambda: {"spend": 0, "income": 0, "count": 0, "name": "Unlinked", "type": "cash", "color": "#94a3b8", "last_four": None})
    for r in result.data:
        aid = r["account_id"] or "unlinked"
        if r["type"] == "expense":
            breakdown[aid]["spend"] += r["amount"]
        else:
            breakdown[aid]["income"] += r["amount"]
        breakdown[aid]["count"] += 1
        if r.get("accounts"):
            breakdown[aid]["name"] = r["accounts"]["name"]
            breakdown[aid]["type"] = r["accounts"]["type"]
            breakdown[aid]["color"] = r["accounts"]["color"]
            breakdown[aid]["last_four"] = r["accounts"]["last_four"]

    return [
        {"account_id": k, **{kk: round(vv, 2) if isinstance(vv, float) else vv for kk, vv in v.items()}}
        for k, v in breakdown.items()
    ]


@router.get("/top-merchants", summary="Top 10 most frequent expense titles (merchant insights)")
async def top_merchants(request: Request, month: int = None, year: int = None, limit: int = 10):
    query = (
        supabase.table("expenses")
        .select("title, amount")
        .eq("user_id", request.state.user_id)
        .eq("type", "expense")
    )
    if month and year:
        fd, td = date_range(month, year)
        query = query.gte("date", fd).lte("date", td)
    result = query.execute()

    merchants = defaultdict(lambda: {"count": 0, "total": 0})
    for r in result.data:
        merchants[r["title"]]["count"] += 1
        merchants[r["title"]]["total"] += r["amount"]

    sorted_merchants = sorted(merchants.items(), key=lambda x: x[1]["total"], reverse=True)[:limit]
    return [{"title": k, "count": v["count"], "total": round(v["total"], 2)} for k, v in sorted_merchants]
