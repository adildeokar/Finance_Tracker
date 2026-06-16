import calendar
import csv
import io

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse

from auth.jwt_bearer import jwt_bearer
from database import supabase
from models.schemas import BulkExpenseCreate, ExpenseCreate, ExpenseUpdate

router = APIRouter(prefix="/expenses", tags=["Expenses"], dependencies=[Depends(jwt_bearer)])


@router.post("/", summary="Add a single expense or income, linked to a payment account")
async def create_expense(request: Request, body: ExpenseCreate):
    data = body.model_dump()
    data["user_id"] = request.state.user_id
    data["date"] = str(data["date"])
    result = supabase.table("expenses").insert(data).execute()

    if data.get("account_id") and data["type"] == "expense":
        acc = supabase.table("accounts").select("type, current_balance").eq("id", data["account_id"]).execute()
        if acc.data and acc.data[0]["type"] == "credit_card":
            new_balance = (acc.data[0]["current_balance"] or 0) + data["amount"]
            supabase.table("accounts").update({"current_balance": new_balance}).eq("id", data["account_id"]).execute()

    return result.data[0]


@router.post("/bulk", summary="Bulk create multiple expenses at once (e.g. from CSV import)")
async def bulk_create_expenses(request: Request, body: BulkExpenseCreate):
    user_id = request.state.user_id
    items = []
    for e in body.expenses:
        d = e.model_dump()
        d["user_id"] = user_id
        d["date"] = str(d["date"])
        items.append(d)
    result = supabase.table("expenses").insert(items).execute()
    return {"inserted": len(result.data), "records": result.data}


@router.get("/", summary="Get all expenses with optional filters")
async def get_expenses(
    request: Request,
    type: str = None,
    category_id: str = None,
    account_id: str = None,
    month: int = None,
    year: int = None,
    tag: str = None,
    search: str = None,
    sort_by: str = "date",
    order: str = "desc",
    limit: int = 100,
):
    user_id = request.state.user_id
    query = (
        supabase.table("expenses")
        .select("*, categories(name, color, icon), accounts(name, type, color, last_four)")
        .eq("user_id", user_id)
    )

    if type:
        query = query.eq("type", type)
    if category_id:
        query = query.eq("category_id", category_id)
    if account_id:
        query = query.eq("account_id", account_id)
    if month and year:
        last_day = calendar.monthrange(year, month)[1]
        query = query.gte("date", f"{year}-{month:02d}-01").lte("date", f"{year}-{month:02d}-{last_day}")
    if search:
        query = query.ilike("title", f"%{search}%")

    desc = order == "desc"
    result = query.order(sort_by, desc=desc).limit(limit).execute()
    data = result.data

    if tag:
        data = [r for r in data if tag in (r.get("tags") or [])]

    return data


@router.get("/export/csv", summary="Export all expenses as a CSV file")
async def export_csv(request: Request, month: int = None, year: int = None):
    user_id = request.state.user_id
    query = supabase.table("expenses").select("*, categories(name), accounts(name)").eq("user_id", user_id)
    if month and year:
        last_day = calendar.monthrange(year, month)[1]
        query = query.gte("date", f"{year}-{month:02d}-01").lte("date", f"{year}-{month:02d}-{last_day}")
    result = query.order("date", desc=True).execute()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Title", "Amount", "Type", "Category", "Account", "Tags", "Notes"])
    for r in result.data:
        writer.writerow([
            r["date"],
            r["title"],
            r["amount"],
            r["type"],
            r.get("categories", {}).get("name", "") if r.get("categories") else "",
            r.get("accounts", {}).get("name", "") if r.get("accounts") else "",
            ", ".join(r.get("tags") or []),
            r.get("notes", ""),
        ])
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=expenses.csv"},
    )


@router.get("/{expense_id}", summary="Get a single expense by ID")
async def get_expense(request: Request, expense_id: str):
    result = (
        supabase.table("expenses")
        .select("*, categories(name, color, icon), accounts(name, type, color, last_four)")
        .eq("id", expense_id)
        .eq("user_id", request.state.user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Expense not found.")
    return result.data[0]


@router.put("/{expense_id}", summary="Update an expense")
async def update_expense(request: Request, expense_id: str, body: ExpenseUpdate):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if "date" in updates:
        updates["date"] = str(updates["date"])
    result = (
        supabase.table("expenses")
        .update(updates)
        .eq("id", expense_id)
        .eq("user_id", request.state.user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Expense not found.")
    return result.data[0]


@router.delete("/{expense_id}", summary="Delete an expense")
async def delete_expense(request: Request, expense_id: str):
    supabase.table("expenses").delete().eq("id", expense_id).eq("user_id", request.state.user_id).execute()
    return {"message": "Expense deleted."}
