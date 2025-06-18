from fastapi import Request, HTTPException
from firebase_admin import auth, credentials, initialize_app
from services.secret_manager import getsecret
from models.user_model import User
from datetime import datetime
from repository.user_repository import save_user, get_user
import json

secret_json = getsecret('firebase-service-account')
cred_dict = json.loads(secret_json)
cred = credentials.Certificate(cred_dict)
initialize_app(cred)

def extract_token_from_request(request: Request) -> str:
    """リクエストからFirebase IDトークンを抽出する関数"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header")
    
    token = auth_header.split(" ")[1]
    return token

def verify_id_token(request: Request) -> dict:
    """Firebase IDトークンを検証する関数"""
    # Bearerトークンをリクエストから抽出.
    token = extract_token_from_request(request)
    if not token:
        raise HTTPException(status_code=401, detail="Token not found")

    # Firebase Admin SDKで検証.
    try:
        decoded_token = auth.verify_id_token(token) 
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_me_service(request: Request):
    """ユーザー情報を取得するサービス関数"""
    decoded = verify_id_token(request)
    user = get_user(decoded["uid"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def login_service(request: Request):
    """ログイン処理のサービス関数"""
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
