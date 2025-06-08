from fastapi import APIRouter
from schemas.auth import User, LoginRequest
from datetime import datetime

router = APIRouter()

@router.post("/api/auth/login")
def login(req: LoginRequest):
    return {"userId": "dummy-user-id"}

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
