import calendar
from collections import defaultdict
from datetime import date

from fastapi import APIRouter, Depends, Request

from backend.auth.jwt_bearer import jwt_bearer
from backend.database import supabase

router = APIRouter(prefix="/alerts", tags=["Alerts & Insights"], dependencies=[Depends(jwt_bearer)])


@router.get("/", summary="Get all alerts for the current user")
async def get_alerts(request: Request, unread_only: bool = False):
    query = supabase.table("alerts").select("*").eq("user_id", request.state.user_id)
    if unread_only:
        query = query.eq("is_read", False)
    return query.order("created_at", desc=True).limit(50).execute().data


@router.put("/{alert_id}/read", summary="Mark an alert as read")
async def mark_read(request: Request, alert_id: str):
    supabase.table("alerts").update({"is_read": True}).eq("id", alert_id).eq("user_id", request.state.user_id).execute()
    return {"message": "Alert marked as read."}


@router.put("/read-all", summary="Mark all alerts as read")
async def mark_all_read(request: Request):
    supabase.table("alerts").update({"is_read": True}).eq("user_id", request.state.user_id).execute()
    return {"message": "All alerts marked as read."}


@router.delete("/{alert_id}", summary="Delete an alert")
async def delete_alert(request: Request, alert_id: str):
    supabase.table("alerts").delete().eq("id", alert_id).eq("user_id", request.state.user_id).execute()
    return {"message": "Alert deleted."}


@router.post("/generate", summary="Run budget checks and auto-generate alerts for this month")
async def generate_alerts(request: Request):
    user_id = request.state.user_id
    today = date.today()
    month, year = today.month, today.year
    last_day = calendar.monthrange(year, month)[1]
    fd = f"{year}-{month:02d}-01"
    td = f"{year}-{month:02d}-{last_day}"

    budgets = (
        supabase.table("budgets")
        .select("*, categories(name)")
        .eq("user_id", user_id)
        .eq("month", month)
        .eq("year", year)
        .execute()
    )
    expenses = (
        supabase.table("expenses")
        .select("amount, category_id")
        .eq("user_id", user_id)
        .eq("type", "expense")
        .gte("date", fd)
        .lte("date", td)
        .execute()
    )

    actuals = defaultdict(float)
    for e in expenses.data:
        if e["category_id"]:
            actuals[e["category_id"]] += e["amount"]

    alerts_created = []
    for b in budgets.data:
        spent = actuals.get(b["category_id"], 0)
        pct = (spent / b["monthly_limit"]) * 100 if b["monthly_limit"] > 0 else 0
        cat_name = b["categories"]["name"] if b.get("categories") else "Unknown"

        if pct >= 100:
            supabase.table("alerts").insert({
                "user_id": user_id,
                "type": "budget_breach",
                "title": f"Budget exceeded: {cat_name}",
                "message": f"You've spent ₹{spent:.0f} of your ₹{b['monthly_limit']:.0f} {cat_name} budget ({pct:.0f}%).",
                "related_id": b["id"],
            }).execute()
            alerts_created.append(cat_name)
        elif pct >= b["alert_threshold"]:
            supabase.table("alerts").insert({
                "user_id": user_id,
                "type": "budget_warning",
                "title": f"Budget warning: {cat_name}",
                "message": f"You've used {pct:.0f}% of your {cat_name} budget this month.",
                "related_id": b["id"],
            }).execute()
            alerts_created.append(cat_name)

    return {"alerts_generated": len(alerts_created), "categories": alerts_created}
