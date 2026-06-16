import calendar
from collections import defaultdict
from datetime import date

from fastapi import APIRouter, Depends, Request

from backend.auth.jwt_bearer import jwt_bearer
from backend.database import supabase

router = APIRouter(prefix="/dashboard", tags=["Dashboard"], dependencies=[Depends(jwt_bearer)])


@router.get("/", summary="Full dashboard snapshot — current month KPIs, recent transactions, account summaries, budget alerts")
async def get_dashboard(request: Request):
    user_id = request.state.user_id
    today = date.today()
    month, year = today.month, today.year
    last_day = calendar.monthrange(year, month)[1]
    fd = f"{year}-{month:02d}-01"
    td = f"{year}-{month:02d}-{last_day}"

    expenses = (
        supabase.table("expenses")
        .select("*, categories(name, color, icon), accounts(name, type, color, last_four)")
        .eq("user_id", user_id)
        .gte("date", fd)
        .lte("date", td)
        .execute()
    )
    budgets = (
        supabase.table("budgets")
        .select("*, categories(name, color)")
        .eq("user_id", user_id)
        .eq("month", month)
        .eq("year", year)
        .execute()
    )
    accounts = supabase.table("accounts").select("*").eq("user_id", user_id).eq("is_active", True).execute()
    goals = supabase.table("goals").select("*").eq("user_id", user_id).eq("is_completed", False).execute()
    unread_alerts = supabase.table("alerts").select("id").eq("user_id", user_id).eq("is_read", False).execute()

    total_income = sum(r["amount"] for r in expenses.data if r["type"] == "income")
    total_expense = sum(r["amount"] for r in expenses.data if r["type"] == "expense")

    actuals = defaultdict(float)
    for e in expenses.data:
        if e["category_id"] and e["type"] == "expense":
            actuals[e["category_id"]] += e["amount"]

    over_budget = [b for b in budgets.data if actuals.get(b["category_id"], 0) > b["monthly_limit"]]
    recent = sorted(expenses.data, key=lambda x: x["date"], reverse=True)[:8]

    return {
        "current_month": f"{calendar.month_name[month]} {year}",
        "total_income": round(total_income, 2),
        "total_expenses": round(total_expense, 2),
        "net_savings": round(total_income - total_expense, 2),
        "savings_rate": round(((total_income - total_expense) / total_income) * 100, 1) if total_income > 0 else 0,
        "transaction_count": len(expenses.data),
        "budgets_over_limit": len(over_budget),
        "unread_alerts": len(unread_alerts.data),
        "active_accounts": len(accounts.data),
        "active_goals": len(goals.data),
        "accounts": accounts.data,
        "recent_transactions": recent,
    }
