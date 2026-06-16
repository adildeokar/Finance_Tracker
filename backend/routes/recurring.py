from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Request

from auth.jwt_bearer import jwt_bearer
from database import supabase
from models.schemas import RecurringCreate, RecurringUpdate

router = APIRouter(prefix="/recurring", tags=["Recurring Transactions"], dependencies=[Depends(jwt_bearer)])


@router.post("/", summary="Create a recurring transaction template (subscription, rent, salary)")
async def create_recurring(request: Request, body: RecurringCreate):
    data = body.model_dump()
    data["user_id"] = request.state.user_id
    data["start_date"] = str(data["start_date"])
    if data.get("end_date"):
        data["end_date"] = str(data["end_date"])
    result = supabase.table("recurring_transactions").insert(data).execute()
    return result.data[0]


@router.get("/", summary="List all recurring transaction templates")
async def get_recurring(request: Request):
    result = (
        supabase.table("recurring_transactions")
        .select("*, categories(name, color, icon), accounts(name, type, last_four)")
        .eq("user_id", request.state.user_id)
        .execute()
    )
    return result.data


@router.post("/apply-due", summary="Auto-generate expense entries for all recurring transactions due today")
async def apply_due_recurring(request: Request):
    user_id = request.state.user_id
    today = date.today()
    result = (
        supabase.table("recurring_transactions")
        .select("*")
        .eq("user_id", user_id)
        .eq("is_active", True)
        .execute()
    )

    applied = []
    for r in result.data:
        due = False
        if r["frequency"] == "monthly" and r["day_of_month"] == today.day:
            due = True
        elif r["frequency"] == "yearly":
            start = date.fromisoformat(r["start_date"])
            if start.month == today.month and start.day == today.day:
                due = True

        if due:
            expense = {
                "user_id": user_id,
                "account_id": r["account_id"],
                "category_id": r["category_id"],
                "title": r["title"],
                "amount": r["amount"],
                "type": r["type"],
                "date": str(today),
                "notes": f"Auto-applied from recurring: {r['title']}",
                "is_recurring": True,
                "recurring_id": r["id"],
            }
            supabase.table("expenses").insert(expense).execute()
            supabase.table("recurring_transactions").update({"last_applied": str(today)}).eq("id", r["id"]).execute()
            applied.append(r["title"])

    return {"applied_count": len(applied), "applied": applied}


@router.put("/{recurring_id}", summary="Update a recurring transaction")
async def update_recurring(request: Request, recurring_id: str, body: RecurringUpdate):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if "end_date" in updates:
        updates["end_date"] = str(updates["end_date"])
    result = (
        supabase.table("recurring_transactions")
        .update(updates)
        .eq("id", recurring_id)
        .eq("user_id", request.state.user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Recurring transaction not found.")
    return result.data[0]


@router.delete("/{recurring_id}", summary="Delete a recurring transaction template")
async def delete_recurring(request: Request, recurring_id: str):
    supabase.table("recurring_transactions").delete().eq("id", recurring_id).eq("user_id", request.state.user_id).execute()
    return {"message": "Recurring transaction deleted."}
