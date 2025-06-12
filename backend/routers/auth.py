from fastapi import APIRouter, Request, HTTPException
from schemas.user import User
from datetime import datetime
from services.auth import verify_id_token
from repository.user_repository import save_user, get_user

router = APIRouter()

@router.get("/api/auth/me", response_model=User)
def get_me(request: Request):
    """ ユーザー情報を取得するエンドポイント """
    decoded = verify_id_token(request)
    user = get_user(decoded["uid"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/api/auth/login")
def login(request: Request):
    # IDトークンを検証
    decoded = verify_id_token(request)
    user_id = decoded["uid"]
    user_obj = User(
        userId=user_id,
        displayName=decoded.get("name", ""),
        email=decoded.get("email", ""),
        provider=decoded.get("firebase", {}).get("sign_in_provider", "google"),
        createdAt=datetime.now(),
        lastLoginAt=datetime.now(),
        preferences={}
    )
    user = save_user(user_obj)
    if not user:
        raise HTTPException(status_code=500, detail="Failed to save user data")
    return {"userId": user_id}

