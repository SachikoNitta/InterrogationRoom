from fastapi import APIRouter, Request
from models.user_model import User
import services.auth_service as auth_service

router = APIRouter()

@router.get("/api/auth/me", response_model=User)
def get_me(request: Request):
    """ ユーザー情報を取得するエンドポイント """
    return auth_service.get_me(request)

@router.post("/api/auth/login")
def login(request: Request):
    return auth_service.login(request)

