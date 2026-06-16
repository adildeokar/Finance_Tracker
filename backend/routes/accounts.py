import calendar
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Request

from backend.auth.jwt_bearer import jwt_bearer
from backend.database import supabase
from backend.models.schemas import AccountCreate, AccountUpdate

router = APIRouter(prefix="/accounts", tags=["Payment Accounts"], dependencies=[Depends(jwt_bearer)])


@router.post("/", summary="Add a new payment account (credit card, savings, etc.)")
async def create_account(request: Request, body: AccountCreate):
    data = body.model_dump()
    data["user_id"] = request.state.user_id
    result = supabase.table("accounts").insert(data).execute()
    return result.data[0]


@router.get("/", summary="List all payment accounts for this user")
async def get_accounts(request: Request):
    result = (
        supabase.table("accounts")
        .select("*")
        .eq("user_id", request.state.user_id)
        .eq("is_active", True)
        .execute()
    )
    return result.data


@router.get("/{account_id}", summary="Get a single account with its spending summary")
async def get_account(request: Request, account_id: str):
    result = (
        supabase.table("accounts")
        .select("*")
        .eq("id", account_id)
        .eq("user_id", request.state.user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Account not found.")
    account = result.data[0]

    today = date.today()
    from_date = f"{today.year}-{today.month:02d}-01"
    last_day = calendar.monthrange(today.year, today.month)[1]
    to_date = f"{today.year}-{today.month:02d}-{last_day}"

    txns = (
        supabase.table("expenses")
        .select("type, amount")
        .eq("user_id", request.state.user_id)
        .eq("account_id", account_id)
        .gte("date", from_date)
        .lte("date", to_date)
        .execute()
    )
    monthly_spend = sum(t["amount"] for t in txns.data if t["type"] == "expense")
    monthly_income = sum(t["amount"] for t in txns.data if t["type"] == "income")

    return {
        **account,
        "monthly_spend": round(monthly_spend, 2),
        "monthly_income": round(monthly_income, 2),
    }


@router.get("/{account_id}/transactions", summary="Get all transactions for a specific account")
async def get_account_transactions(
    request: Request,
    account_id: str,
    month: int = None,
    year: int = None,
    limit: int = 50,
):
    query = (
        supabase.table("expenses")
        .select("*, categories(name, color, icon)")
        .eq("user_id", request.state.user_id)
        .eq("account_id", account_id)
    )
    if month and year:
        last_day = calendar.monthrange(year, month)[1]
        query = query.gte("date", f"{year}-{month:02d}-01").lte("date", f"{year}-{month:02d}-{last_day}")
    result = query.order("date", desc=True).limit(limit).execute()
    return result.data


@router.get("/{account_id}/credit-summary", summary="Credit card utilisation summary (credit cards only)")
async def credit_summary(request: Request, account_id: str):
    account = (
        supabase.table("accounts")
        .select("*")
        .eq("id", account_id)
        .eq("user_id", request.state.user_id)
        .execute()
    )
    if not account.data or account.data[0]["type"] != "credit_card":
        raise HTTPException(status_code=400, detail="Account is not a credit card.")
    acc = account.data[0]
    utilisation = round((acc["current_balance"] / acc["credit_limit"]) * 100, 1) if acc["credit_limit"] else 0
    return {
        "account": acc,
        "credit_limit": acc["credit_limit"],
        "current_balance": acc["current_balance"],
        "available_credit": round(acc["credit_limit"] - acc["current_balance"], 2),
        "utilisation_percentage": utilisation,
        "utilisation_status": "high" if utilisation > 75 else "moderate" if utilisation > 40 else "healthy",
    }


@router.put("/{account_id}", summary="Update an account")
async def update_account(request: Request, account_id: str, body: AccountUpdate):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    result = (
        supabase.table("accounts")
        .update(updates)
        .eq("id", account_id)
        .eq("user_id", request.state.user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Account not found.")
    return result.data[0]


@router.delete("/{account_id}", summary="Deactivate an account (soft delete)")
async def delete_account(request: Request, account_id: str):
    supabase.table("accounts").update({"is_active": False}).eq("id", account_id).eq("user_id", request.state.user_id).execute()
    return {"message": "Account deactivated."}
