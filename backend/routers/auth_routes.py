from fastapi import APIRouter, Request
from models.user_model import User
from services.auth_service import *

router = APIRouter()

@router.get("/api/auth/me", response_model=User)
def get_me(request: Request):
    """ ユーザー情報を取得するエンドポイント """
    return get_me_service(request)

@router.post("/api/auth/login")
def login(request: Request):
    return login_service(request)

