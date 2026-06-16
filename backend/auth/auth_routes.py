from fastapi import APIRouter, Depends, HTTPException, Request
import bcrypt

from auth.jwt_bearer import jwt_bearer
from auth.jwt_handler import create_access_token
from database import supabase
from models.schemas import ChangePassword, UserLogin, UserRegister

router = APIRouter(prefix="/auth", tags=["Authentication"])


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


@router.post("/register", summary="Register a new individual user account")
async def register(user: UserRegister):
    existing = supabase.table("users").select("id").eq("email", user.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered.")
    hashed = hash_password(user.password)
    result = supabase.table("users").insert({
        "name": user.name,
        "email": user.email,
        "hashed_password": hashed,
        "currency": user.currency or "INR",
    }).execute()
    u = result.data[0]
    token = create_access_token(u["id"], u["email"], u["name"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": u["id"],
            "name": u["name"],
            "email": u["email"],
            "currency": u["currency"],
        },
    }


@router.post("/login", summary="Login with email + password, receive JWT")
async def login(credentials: UserLogin):
    result = supabase.table("users").select("*").eq("email", credentials.email).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    user = result.data[0]
    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    token = create_access_token(user["id"], user["email"], user["name"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "currency": user["currency"],
        },
    }


@router.get("/me", summary="Get the currently authenticated user's profile", dependencies=[Depends(jwt_bearer)])
async def get_me(request: Request):
    result = (
        supabase.table("users")
        .select("id, name, email, currency, avatar_color, created_at")
        .eq("id", request.state.user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found.")
    return result.data[0]


@router.put("/me", summary="Update user profile (name, currency, avatar_color)", dependencies=[Depends(jwt_bearer)])
async def update_profile(request: Request, body: dict):
    allowed = {k: v for k, v in body.items() if k in ["name", "currency", "avatar_color"]}
    result = supabase.table("users").update(allowed).eq("id", request.state.user_id).execute()
    return result.data[0]


@router.post("/change-password", summary="Change the authenticated user's password", dependencies=[Depends(jwt_bearer)])
async def change_password(request: Request, body: ChangePassword):
    result = supabase.table("users").select("hashed_password").eq("id", request.state.user_id).execute()
    user = result.data[0]
    if not verify_password(body.current_password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    new_hash = hash_password(body.new_password)
    supabase.table("users").update({"hashed_password": new_hash}).eq("id", request.state.user_id).execute()
    return {"message": "Password updated successfully."}
