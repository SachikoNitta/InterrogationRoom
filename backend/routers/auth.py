from fastapi import APIRouter
from schemas.user import User, LoginRequest
from datetime import datetime
from services.auth import verify_id_token
from fastapi import Request, HTTPException
from repository.user_repository import save_user

router = APIRouter()

@router.post("/api/auth/login")
def login(request: Request):
    # IDトークンを検証
    try:
        decoded = verify_id_token(request)
        print(f"Decoded ID token: {decoded}")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid ID token")
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
    save_user(user_obj)
    return {"userId": user_id}

@router.get("/api/auth/me", response_model=User)
def get_me():
    return User(
        userId="dummy-user-id",
        displayName="ダミーユーザー",
        email="dummy@example.com",
        provider="google",
        createdAt=datetime.now(),
        lastLoginAt=datetime.now(),
        preferences={}
    )
