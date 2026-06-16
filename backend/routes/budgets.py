from fastapi import APIRouter, Depends, HTTPException, Request

from backend.auth.jwt_bearer import jwt_bearer
from backend.database import supabase
from backend.models.schemas import BudgetCreate, BudgetUpdate

router = APIRouter(prefix="/budgets", tags=["Budgets"], dependencies=[Depends(jwt_bearer)])


@router.post("/", summary="Set a monthly budget limit for a category")
async def create_budget(request: Request, body: BudgetCreate):
    data = body.model_dump()
    data["user_id"] = request.state.user_id
    result = supabase.table("budgets").insert(data).execute()
    return result.data[0]


@router.get("/", summary="Get all budgets, optionally filtered by month and year")
async def get_budgets(request: Request, month: int = None, year: int = None):
    query = (
        supabase.table("budgets")
        .select("*, categories(name, color, icon)")
        .eq("user_id", request.state.user_id)
    )
    if month:
        query = query.eq("month", month)
    if year:
        query = query.eq("year", year)
    return query.execute().data


@router.put("/{budget_id}", summary="Update a budget's limit or alert threshold")
async def update_budget(request: Request, budget_id: str, body: BudgetUpdate):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    result = (
        supabase.table("budgets")
        .update(updates)
        .eq("id", budget_id)
        .eq("user_id", request.state.user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Budget not found.")
    return result.data[0]


@router.delete("/{budget_id}", summary="Delete a budget")
async def delete_budget(request: Request, budget_id: str):
    supabase.table("budgets").delete().eq("id", budget_id).eq("user_id", request.state.user_id).execute()
    return {"message": "Budget deleted."}
