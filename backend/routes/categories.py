from fastapi import APIRouter, Depends, HTTPException, Request

from backend.auth.jwt_bearer import jwt_bearer
from backend.database import supabase
from backend.models.schemas import CategoryCreate, CategoryUpdate

router = APIRouter(prefix="/categories", tags=["Categories"], dependencies=[Depends(jwt_bearer)])

COLOUR_PALETTE = [
    "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
    "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#3b82f6",
    "#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#f43f5e",
    "#64748b", "#0ea5e9", "#d946ef", "#fb923c", "#4ade80",
]


@router.get("/palette", summary="Get the available colour palette for categories")
async def get_palette():
    return {"colours": COLOUR_PALETTE}


@router.post("/", summary="Create a colour-coded, icon-tagged category")
async def create_category(request: Request, body: CategoryCreate):
    data = body.model_dump()
    data["user_id"] = request.state.user_id
    result = supabase.table("categories").insert(data).execute()
    return result.data[0]


@router.get("/", summary="List all categories for this user")
async def get_categories(request: Request, type: str = None):
    query = supabase.table("categories").select("*").eq("user_id", request.state.user_id)
    if type:
        query = query.in_("type", [type, "both"])
    result = query.execute()
    return result.data


@router.put("/{category_id}", summary="Update a category's name, colour, or icon")
async def update_category(request: Request, category_id: str, body: CategoryUpdate):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    result = (
        supabase.table("categories")
        .update(updates)
        .eq("id", category_id)
        .eq("user_id", request.state.user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Category not found.")
    return result.data[0]


@router.delete("/{category_id}", summary="Delete a category")
async def delete_category(request: Request, category_id: str):
    supabase.table("categories").delete().eq("id", category_id).eq("user_id", request.state.user_id).execute()
    return {"message": "Category deleted."}
