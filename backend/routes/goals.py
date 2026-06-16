from fastapi import APIRouter, Depends, HTTPException, Request

from backend.auth.jwt_bearer import jwt_bearer
from backend.database import supabase
from backend.models.schemas import GoalCreate, GoalUpdate

router = APIRouter(prefix="/goals", tags=["Financial Goals"], dependencies=[Depends(jwt_bearer)])


@router.post("/", summary="Create a new savings goal")
async def create_goal(request: Request, body: GoalCreate):
    data = body.model_dump()
    data["user_id"] = request.state.user_id
    if data.get("target_date"):
        data["target_date"] = str(data["target_date"])
    result = supabase.table("goals").insert(data).execute()
    return result.data[0]


@router.get("/", summary="List all financial goals with progress percentage")
async def get_goals(request: Request):
    result = (
        supabase.table("goals")
        .select("*, accounts(name, type)")
        .eq("user_id", request.state.user_id)
        .execute()
    )
    goals = []
    for g in result.data:
        progress = round((g["current_amount"] / g["target_amount"]) * 100, 1) if g["target_amount"] > 0 else 0
        goals.append({**g, "progress_percentage": min(progress, 100)})
    return goals


@router.post("/{goal_id}/contribute", summary="Add a contribution amount toward a goal")
async def contribute_to_goal(request: Request, goal_id: str, body: dict):
    amount = body.get("amount", 0)
    result = supabase.table("goals").select("*").eq("id", goal_id).eq("user_id", request.state.user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Goal not found.")
    goal = result.data[0]
    new_amount = min(goal["current_amount"] + amount, goal["target_amount"])
    completed = new_amount >= goal["target_amount"]
    updated = supabase.table("goals").update({"current_amount": new_amount, "is_completed": completed}).eq("id", goal_id).execute()
    return {**updated.data[0], "goal_reached": completed}


@router.put("/{goal_id}", summary="Update a goal")
async def update_goal(request: Request, goal_id: str, body: GoalUpdate):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if "target_date" in updates:
        updates["target_date"] = str(updates["target_date"])
    result = (
        supabase.table("goals")
        .update(updates)
        .eq("id", goal_id)
        .eq("user_id", request.state.user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Goal not found.")
    return result.data[0]


@router.delete("/{goal_id}", summary="Delete a goal")
async def delete_goal(request: Request, goal_id: str):
    supabase.table("goals").delete().eq("id", goal_id).eq("user_id", request.state.user_id).execute()
    return {"message": "Goal deleted."}
